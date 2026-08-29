import fs from "fs";
import path from "path";
import {
  LoanApplication,
  PersonalLoanAgreement,
  LoanRecord,
  AuditLogEntry,
  EmailLogEntry,
  ApplicationStatus,
  RepaymentFrequency,
} from "@/lib/models/types";
import { generateApplicationId, generateAgreementId, generateLoanId, calculateEMI } from "@/lib/utils";

// Path to persistent JSON database file
// On Vercel / serverless environments, /tmp is the only writable filesystem directory
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? "/tmp" : path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "database.json");
const BUNDLED_DB_FILE = path.join(process.cwd(), "data", "database.json");

interface DatabaseSchema {
  applications: LoanApplication[];
  agreements: PersonalLoanAgreement[];
  loans: LoanRecord[];
  auditLogs: AuditLogEntry[];
  emailLogs: EmailLogEntry[];
}

// Global Memory & File Store Instance
class DataStore {
  private applications: LoanApplication[] = [];
  private agreements: PersonalLoanAgreement[] = [];
  private loans: LoanRecord[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private emailLogs: EmailLogEntry[] = [];
  private isLoaded = false;

  constructor() {
    this.ensureDataDir();
    this.loadFromFile();
  }

  private ensureDataDir(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (err) {
      console.warn("Failed to create data directory:", err);
    }
  }

  private loadFromFile(): void {
    try {
      let targetFile = DB_FILE;
      if (!fs.existsSync(DB_FILE) && fs.existsSync(BUNDLED_DB_FILE)) {
        targetFile = BUNDLED_DB_FILE;
      }

      if (fs.existsSync(targetFile)) {
        const raw = fs.readFileSync(targetFile, "utf-8");
        if (raw && raw.trim()) {
          const parsed: DatabaseSchema = JSON.parse(raw);
          if (Array.isArray(parsed.applications) && parsed.applications.length > 0) {
            this.applications = parsed.applications;
          }
          if (Array.isArray(parsed.agreements) && parsed.agreements.length > 0) {
            this.agreements = parsed.agreements;
          }
          if (Array.isArray(parsed.loans) && parsed.loans.length > 0) {
            this.loans = parsed.loans;
          }
          if (Array.isArray(parsed.auditLogs) && parsed.auditLogs.length > 0) {
            this.auditLogs = parsed.auditLogs;
          }
          if (Array.isArray(parsed.emailLogs) && parsed.emailLogs.length > 0) {
            this.emailLogs = parsed.emailLogs;
          }
          this.isLoaded = true;
          return;
        }
      }
    } catch (err) {
      console.warn("Error reading from database.json, keeping in-memory state:", err);
    }
    this.isLoaded = true;
  }

  private saveToFile(): void {
    try {
      this.ensureDataDir();
      const payload: DatabaseSchema = {
        applications: this.applications,
        agreements: this.agreements,
        loans: this.loans,
        auditLogs: this.auditLogs,
        emailLogs: this.emailLogs,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), "utf-8");
    } catch (err) {
      console.warn("Notice: Operating with in-memory persistence:", err);
    }
  }

  private sync(): void {
    if (!this.isLoaded) {
      this.loadFromFile();
    }
  }

  // ---------------- Applications ----------------
  public getApplications(): LoanApplication[] {
    this.sync();
    return [...this.applications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getApplicationById(idOrAppId: string): LoanApplication | undefined {
    this.sync();
    const query = idOrAppId.trim().toLowerCase();
    return this.applications.find(
      (app) =>
        app.id === idOrAppId ||
        app.applicationId.toLowerCase() === query ||
        (app.agreementId && app.agreementId.toLowerCase() === query)
    );
  }

  public findApplicationForCustomer(
    applicationId: string,
    mobileOrEmail: string
  ): LoanApplication | undefined {
    this.sync();
    const cleanedSearch = mobileOrEmail.replace(/\D/g, ""); // extract numbers
    const cleanEmailSearch = mobileOrEmail.trim().toLowerCase();

    return this.applications.find((app) => {
      const matchId = app.applicationId.toLowerCase() === applicationId.trim().toLowerCase();
      const appMobileDigits = app.borrower.mobile.replace(/\D/g, "");
      const appEmail = app.borrower.email.trim().toLowerCase();

      const matchMobile =
        cleanedSearch.length >= 6 &&
        (appMobileDigits.includes(cleanedSearch) || cleanedSearch.includes(appMobileDigits.slice(-10)));
      const matchEmail = appEmail === cleanEmailSearch;

      return matchId && (matchMobile || matchEmail);
    });
  }

  public addApplication(app: Omit<LoanApplication, "id" | "createdAt" | "updatedAt">): LoanApplication {
    this.sync();
    const now = new Date().toISOString();
    const newApp: LoanApplication = {
      ...app,
      id: `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.applications.unshift(newApp);

    // Auto-create corresponding loan ledger record
    const rate =
      newApp.loan.proposedInterestRateAnnual ||
      (newApp.loan.tenureMonths <= 3 ? 13.5 : 14.7);
    const { emi, totalInterest, totalPayable } = calculateEMI(
      newApp.loan.amount,
      rate,
      newApp.loan.tenureMonths
    );

    const loanId = generateLoanId();
    const schedule = Array.from({ length: newApp.loan.tenureMonths }).map((_, idx) => {
      const dueDate = new Date(newApp.loan.proposedDisbursementDate || now);
      dueDate.setMonth(dueDate.getMonth() + idx + 1);
      return {
        installmentNumber: idx + 1,
        dueDate: dueDate.toISOString().split("T")[0],
        expectedAmount: emi,
        principalComponent: Math.round(newApp.loan.amount / newApp.loan.tenureMonths),
        interestComponent: Math.round(totalInterest / newApp.loan.tenureMonths),
        paidAmount: 0,
        status: "PENDING" as const,
      };
    });

    const newLoan: LoanRecord = {
      id: `loan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      loanId,
      applicationId: newApp.applicationId,
      borrowerName: newApp.borrower.fullName,
      borrowerMobile: newApp.borrower.mobile,
      borrowerEmail: newApp.borrower.email,
      principalAmount: newApp.loan.amount,
      interestRateAnnual: rate,
      totalPayable,
      totalPaid: 0,
      outstandingBalance: totalPayable,
      tenureMonths: newApp.loan.tenureMonths,
      disbursementDate: (newApp.loan.proposedDisbursementDate || now).split("T")[0],
      repaymentFrequency: newApp.loan.repaymentFrequency || "MONTHLY",
      nextDueDate: schedule[0]?.dueDate || now.split("T")[0],
      status: "ACTIVE",
      schedule,
      repayments: [],
      createdAt: now,
      updatedAt: now,
    };
    this.loans.unshift(newLoan);

    this.addAuditLog({
      actorId: "borrower",
      actorName: newApp.borrower.fullName,
      actorRole: "BORROWER",
      action: "APPLICATION_CREATED",
      targetId: newApp.applicationId,
      targetType: "APPLICATION",
      metadata: { amount: newApp.loan.amount, product: newApp.loan.productId, loanId },
    });

    this.saveToFile();
    return newApp;
  }

  public updateApplicationStatus(
    idOrAppId: string,
    newStatus: ApplicationStatus,
    changedBy: string,
    note?: string
  ): LoanApplication | null {
    this.sync();
    const app = this.getApplicationById(idOrAppId);
    if (!app) return null;

    const oldStatus = app.status;
    app.status = newStatus;
    app.updatedAt = new Date().toISOString();
    app.statusHistory.push({
      status: newStatus,
      changedBy,
      changedAt: app.updatedAt,
      note,
    });

    this.addAuditLog({
      actorId: "admin",
      actorName: changedBy,
      actorRole: "ADMIN",
      action: "STATUS_CHANGED",
      targetId: app.applicationId,
      targetType: "APPLICATION",
      metadata: { from: oldStatus, to: newStatus, note },
    });

    this.saveToFile();
    return app;
  }

  public addAdminNote(idOrAppId: string, note: { authorId: string; authorName: string; content: string }): LoanApplication | null {
    this.sync();
    const app = this.getApplicationById(idOrAppId);
    if (!app) return null;

    const now = new Date().toISOString();
    app.adminNotes.unshift({
      id: `note-${Date.now()}`,
      authorId: note.authorId,
      authorName: note.authorName,
      content: note.content,
      createdAt: now,
    });
    app.updatedAt = now;

    this.addAuditLog({
      actorId: note.authorId,
      actorName: note.authorName,
      actorRole: "ADMIN",
      action: "ADMIN_NOTE_ADDED",
      targetId: app.applicationId,
      targetType: "APPLICATION",
    });

    this.saveToFile();
    return app;
  }

  public addCustomerMessage(
    idOrAppId: string,
    message: {
      type: "INFO_REQUEST" | "STATUS_UPDATE" | "BORROWER_REPLY";
      sender: "ADMIN" | "BORROWER";
      title: string;
      message: string;
      requestedDocs?: string[];
    }
  ): LoanApplication | null {
    this.sync();
    const app = this.getApplicationById(idOrAppId);
    if (!app) return null;

    const now = new Date().toISOString();
    app.messages.unshift({
      id: `msg-${Date.now()}`,
      ...message,
      createdAt: now,
    });
    app.updatedAt = now;

    this.saveToFile();
    return app;
  }

  // ---------------- Agreements ----------------
  public getAgreements(): PersonalLoanAgreement[] {
    this.sync();
    return [...this.agreements];
  }

  public getAgreementById(agreementId: string): PersonalLoanAgreement | undefined {
    this.sync();
    return this.agreements.find(
      (a) =>
        a.id === agreementId ||
        a.agreementId.toLowerCase() === agreementId.toLowerCase() ||
        a.applicationId.toLowerCase() === agreementId.toLowerCase()
    );
  }

  public createAgreement(agreementData: Omit<PersonalLoanAgreement, "id" | "generatedAt" | "updatedAt">): PersonalLoanAgreement {
    this.sync();
    const now = new Date().toISOString();
    const newAgreement: PersonalLoanAgreement = {
      ...agreementData,
      id: `agr-${Date.now()}`,
      generatedAt: now,
      updatedAt: now,
    };
    this.agreements.unshift(newAgreement);

    // Link back to application
    const app = this.getApplicationById(agreementData.applicationId);
    if (app) {
      app.agreementId = newAgreement.agreementId;
      app.status = "AGREEMENT_PENDING";
      app.updatedAt = now;
    }

    this.addAuditLog({
      actorId: "system",
      actorName: "Agreement Generator",
      actorRole: "SYSTEM",
      action: "AGREEMENT_GENERATED",
      targetId: newAgreement.agreementId,
      targetType: "AGREEMENT",
      metadata: { applicationId: agreementData.applicationId },
    });

    this.saveToFile();
    return newAgreement;
  }

  public signAgreement(
    agreementId: string,
    signature: {
      signatureType: "DRAWN" | "TYPED";
      signatureData: string;
      signedIp?: string;
    }
  ): PersonalLoanAgreement | null {
    this.sync();
    let agreement = this.getAgreementById(agreementId);

    if (!agreement) {
      // Auto-resolve by application if agreement wasn't persisted yet
      const query = agreementId.trim().toLowerCase();
      const app =
        this.getApplicationById(agreementId) ||
        this.applications.find(
          (a) =>
            a.applicationId.toLowerCase() === query ||
            (a.agreementId && a.agreementId.toLowerCase() === query)
        );

      if (app) {
        const rate =
          app.loan.proposedInterestRateAnnual ||
          (app.loan.tenureMonths <= 3 ? 13.5 : 14.7);
        const { emi, totalInterest, totalPayable } = calculateEMI(
          app.loan.amount,
          rate,
          app.loan.tenureMonths
        );

        agreement = this.createAgreement({
          agreementId:
            app.agreementId ||
            (agreementId.toUpperCase().startsWith("NC-AGR")
              ? agreementId.toUpperCase()
              : generateAgreementId()),
          applicationId: app.applicationId,
          borrowerName: app.borrower.fullName,
          borrowerAddress: app.borrower.currentAddress,
          borrowerMobile: app.borrower.mobile,
          borrowerEmail: app.borrower.email,
          principalAmount: app.loan.amount,
          interestRateAnnual: rate,
          calculationMethod: app.loan.calculationMethod || "REDUCING_BALANCE",
          tenureMonths: app.loan.tenureMonths,
          repaymentFrequency: app.loan.repaymentFrequency || "MONTHLY",
          installmentAmount: emi,
          totalInterest,
          totalPayable,
          disbursementDate:
            app.loan.proposedDisbursementDate ||
            new Date().toISOString().split("T")[0],
          agreementVersion: "1.0.0",
          templateVersion: "1.0.0",
          status: "PENDING_SIGNATURE",
          lenderSignature: {
            signatoryName: "Advith Nayak",
            signatoryTitle:
              "Managing Director & Credit Underwriter, Nayak Capital",
            signatureData: "Advith Nayak",
            signedAt: new Date().toISOString(),
          },
        });
      }
    }

    if (!agreement) return null;

    const now = new Date().toISOString();
    agreement.status = "SIGNED";
    agreement.borrowerSignature = {
      signatureType: signature.signatureType,
      signatureData: signature.signatureData,
      signedAt: now,
      signedIp: signature.signedIp,
    };
    agreement.updatedAt = now;

    // Update application status
    const app = this.getApplicationById(agreement.applicationId);
    if (app) {
      app.status = "AGREEMENT_SIGNED";
      app.updatedAt = now;
      app.statusHistory.push({
        status: "AGREEMENT_SIGNED",
        changedBy: `${agreement.borrowerName} (Borrower)`,
        changedAt: now,
        note: "Digital agreement signed and acknowledged.",
      });
    }

    this.addAuditLog({
      actorId: "borrower",
      actorName: agreement.borrowerName,
      actorRole: "BORROWER",
      action: "AGREEMENT_SIGNED",
      targetId: agreement.agreementId,
      targetType: "AGREEMENT",
      metadata: { signatureType: signature.signatureType },
    });

    this.saveToFile();
    return agreement;
  }

  // ---------------- Loans & Repayments ----------------
  public getLoans(): LoanRecord[] {
    this.sync();
    let hasNew = false;
    // Auto-sync any applications into loans so every submitted/active loan is in the ledger
    for (const app of this.applications) {
      const existing = this.loans.find(
        (l) => l.applicationId?.toLowerCase() === app.applicationId.toLowerCase()
      );
      if (!existing) {
        const rate =
          app.loan.proposedInterestRateAnnual ||
          (app.loan.tenureMonths <= 3 ? 13.5 : 14.7);
        const { emi, totalInterest, totalPayable } = calculateEMI(
          app.loan.amount,
          rate,
          app.loan.tenureMonths
        );

        const now = app.createdAt || new Date().toISOString();
        const loanId = generateLoanId();
        const schedule = Array.from({ length: app.loan.tenureMonths }).map((_, idx) => {
          const dueDate = new Date(app.loan.proposedDisbursementDate || now);
          dueDate.setMonth(dueDate.getMonth() + idx + 1);
          return {
            installmentNumber: idx + 1,
            dueDate: dueDate.toISOString().split("T")[0],
            expectedAmount: emi,
            principalComponent: Math.round(app.loan.amount / app.loan.tenureMonths),
            interestComponent: Math.round(totalInterest / app.loan.tenureMonths),
            paidAmount: 0,
            status: "PENDING" as const,
          };
        });

        const newLoan: LoanRecord = {
          id: `loan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          loanId,
          applicationId: app.applicationId,
          agreementId: app.agreementId,
          borrowerName: app.borrower.fullName,
          borrowerMobile: app.borrower.mobile,
          borrowerEmail: app.borrower.email,
          principalAmount: app.loan.amount,
          interestRateAnnual: rate,
          totalPayable,
          totalPaid: 0,
          outstandingBalance: totalPayable,
          tenureMonths: app.loan.tenureMonths,
          disbursementDate: (app.loan.proposedDisbursementDate || now).split("T")[0],
          repaymentFrequency: app.loan.repaymentFrequency || "MONTHLY",
          nextDueDate: schedule[0]?.dueDate || now.split("T")[0],
          status: "ACTIVE",
          schedule,
          repayments: [],
          createdAt: now,
          updatedAt: now,
        };

        this.loans.unshift(newLoan);
        hasNew = true;
      }
    }

    if (hasNew) {
      this.saveToFile();
    }

    return [...this.loans];
  }

  public getLoanById(idOrLoanId: string): LoanRecord | undefined {
    this.sync();
    return this.loans.find(
      (l) =>
        l.id === idOrLoanId ||
        l.loanId.toLowerCase() === idOrLoanId.toLowerCase() ||
        l.applicationId.toLowerCase() === idOrLoanId.toLowerCase()
    );
  }

  public activateLoanFromApplication(app: LoanApplication, agreement: PersonalLoanAgreement): LoanRecord {
    this.sync();
    const now = new Date().toISOString();
    const loanId = generateLoanId();

    const schedule = Array.from({ length: agreement.tenureMonths }).map((_, idx) => {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + idx + 1);
      return {
        installmentNumber: idx + 1,
        dueDate: dueDate.toISOString().split("T")[0],
        expectedAmount: agreement.installmentAmount,
        principalComponent: Math.round(agreement.principalAmount / agreement.tenureMonths),
        interestComponent: Math.round(
          (agreement.totalPayable - agreement.principalAmount) / agreement.tenureMonths
        ),
        paidAmount: 0,
        status: "PENDING" as const,
      };
    });

    const newLoan: LoanRecord = {
      id: `loan-${Date.now()}`,
      loanId,
      applicationId: app.applicationId,
      agreementId: agreement.agreementId,
      borrowerName: app.borrower.fullName,
      borrowerMobile: app.borrower.mobile,
      borrowerEmail: app.borrower.email,
      principalAmount: agreement.principalAmount,
      interestRateAnnual: agreement.interestRateAnnual,
      totalPayable: agreement.totalPayable,
      totalPaid: 0,
      outstandingBalance: agreement.totalPayable,
      tenureMonths: agreement.tenureMonths,
      disbursementDate: now.split("T")[0],
      repaymentFrequency: agreement.repaymentFrequency,
      nextDueDate: schedule[0]?.dueDate || now.split("T")[0],
      status: "ACTIVE",
      schedule,
      repayments: [],
      createdAt: now,
      updatedAt: now,
    };

    this.loans.unshift(newLoan);

    // Update application to ACTIVE
    app.status = "ACTIVE";
    app.updatedAt = now;
    app.statusHistory.push({
      status: "ACTIVE",
      changedBy: "Loan Operations",
      changedAt: now,
      note: `Loan disbursed and activated. Account: ${loanId}`,
    });

    this.addAuditLog({
      actorId: "admin",
      actorName: "Loan Operations",
      actorRole: "ADMIN",
      action: "LOAN_ACTIVATED",
      targetId: loanId,
      targetType: "LOAN",
      metadata: { applicationId: app.applicationId, principal: agreement.principalAmount },
    });

    this.saveToFile();
    return newLoan;
  }

  public recordRepayment(
    loanId: string,
    payment: {
      amount: number;
      paymentDate: string;
      paymentMethod: string;
      transactionReference: string;
      recordedBy: string;
      notes?: string;
    }
  ): LoanRecord | null {
    this.sync();
    const loan = this.getLoanById(loanId);
    if (!loan) return null;

    const receiptId = `NC-RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    loan.totalPaid += payment.amount;
    loan.outstandingBalance = Math.max(0, loan.totalPayable - loan.totalPaid);

    // Update schedule installments
    let remainingPayment = payment.amount;
    for (const inst of loan.schedule) {
      if (inst.status !== "PAID" && remainingPayment > 0) {
        const required = inst.expectedAmount - inst.paidAmount;
        if (remainingPayment >= required) {
          inst.paidAmount = inst.expectedAmount;
          inst.status = "PAID";
          inst.paidDate = payment.paymentDate;
          inst.paymentMethod = payment.paymentMethod as any;
          inst.transactionReference = payment.transactionReference;
          remainingPayment -= required;
        } else {
          inst.paidAmount += remainingPayment;
          inst.status = "PARTIALLY_PAID";
          remainingPayment = 0;
        }
      }
    }

    if (loan.outstandingBalance <= 0) {
      loan.status = "PAID";
    } else if (loan.totalPaid > 0) {
      loan.status = "PARTIALLY_PAID";
    }

    loan.repayments.unshift({
      id: `rep-${Date.now()}`,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      transactionReference: payment.transactionReference,
      recordedBy: payment.recordedBy,
      receiptId,
      notes: payment.notes,
    });
    loan.updatedAt = now;

    this.addAuditLog({
      actorId: "admin",
      actorName: payment.recordedBy,
      actorRole: "ADMIN",
      action: "PAYMENT_RECORDED",
      targetId: loan.loanId,
      targetType: "LOAN",
      metadata: { amount: payment.amount, receiptId, reference: payment.transactionReference },
    });

    this.saveToFile();
    return loan;
  }

  public addManualLoan(data: {
    borrowerName: string;
    borrowerMobile: string;
    borrowerEmail: string;
    principalAmount: number;
    interestRateAnnual: number;
    tenureMonths: number;
    disbursementDate: string;
    repaymentFrequency?: RepaymentFrequency;
    status?: any;
    notes?: string;
  }): LoanRecord {
    this.sync();
    const now = new Date().toISOString();
    const loanId = generateLoanId();
    const appId = `NC-APP-CLIENT-${Math.floor(1000 + Math.random() * 9000)}`;

    const totalInterest = Math.round(data.principalAmount * (data.interestRateAnnual / 100));
    const totalPayable = data.principalAmount + totalInterest;
    const installmentAmount = Math.max(1, Math.round(totalPayable / data.tenureMonths));

    const schedule = Array.from({ length: data.tenureMonths }).map((_, idx) => {
      const dueDate = new Date(data.disbursementDate || now);
      dueDate.setMonth(dueDate.getMonth() + idx + 1);
      return {
        installmentNumber: idx + 1,
        dueDate: dueDate.toISOString().split("T")[0],
        expectedAmount: installmentAmount,
        principalComponent: Math.round(data.principalAmount / data.tenureMonths),
        interestComponent: Math.round(totalInterest / data.tenureMonths),
        paidAmount: 0,
        status: "PENDING" as const,
      };
    });

    const newLoan: LoanRecord = {
      id: `loan-${Date.now()}`,
      loanId,
      applicationId: appId,
      agreementId: `NC-AGR-CLIENT-${Math.floor(1000 + Math.random() * 9000)}`,
      borrowerName: data.borrowerName,
      borrowerMobile: data.borrowerMobile,
      borrowerEmail: data.borrowerEmail,
      principalAmount: data.principalAmount,
      interestRateAnnual: data.interestRateAnnual,
      totalPayable,
      totalPaid: 0,
      outstandingBalance: totalPayable,
      tenureMonths: data.tenureMonths,
      disbursementDate: data.disbursementDate || now.split("T")[0],
      repaymentFrequency: data.repaymentFrequency || "MONTHLY",
      nextDueDate: schedule[0]?.dueDate || data.disbursementDate || now.split("T")[0],
      status: data.status || "ACTIVE",
      schedule,
      repayments: [],
      createdAt: now,
      updatedAt: now,
    };

    this.loans.unshift(newLoan);

    this.addAuditLog({
      actorId: "admin",
      actorName: "Advith Nayak (Admin)",
      actorRole: "ADMIN",
      action: "MANUAL_LOAN_CREATED",
      targetId: loanId,
      targetType: "LOAN",
      metadata: { borrower: data.borrowerName, principal: data.principalAmount },
    });

    this.saveToFile();
    return newLoan;
  }

  public updateLoan(
    idOrLoanId: string,
    updates: Partial<Omit<LoanRecord, "id" | "loanId" | "createdAt">>
  ): LoanRecord | null {
    this.sync();
    const loan = this.getLoanById(idOrLoanId);
    if (!loan) return null;

    Object.assign(loan, updates);
    loan.updatedAt = new Date().toISOString();

    this.addAuditLog({
      actorId: "admin",
      actorName: "Advith Nayak (Admin)",
      actorRole: "ADMIN",
      action: "LOAN_UPDATED",
      targetId: loan.loanId,
      targetType: "LOAN",
      metadata: { updates },
    });

    this.saveToFile();
    return loan;
  }

  public deleteLoan(idOrLoanId: string): boolean {
    this.sync();
    const idx = this.loans.findIndex(
      (l) => l.id === idOrLoanId || l.loanId.toLowerCase() === idOrLoanId.toLowerCase()
    );
    if (idx === -1) return false;

    const removed = this.loans.splice(idx, 1)[0];

    this.addAuditLog({
      actorId: "admin",
      actorName: "Advith Nayak (Admin)",
      actorRole: "ADMIN",
      action: "LOAN_DELETED",
      targetId: removed.loanId,
      targetType: "LOAN",
      metadata: { borrower: removed.borrowerName, amount: removed.principalAmount },
    });

    this.saveToFile();
    return true;
  }

  // ---------------- Audit & Email Logs ----------------
  public getAuditLogs(): AuditLogEntry[] {
    this.sync();
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newEntry);
    this.saveToFile();
    return newEntry;
  }

  public getEmailLogs(): EmailLogEntry[] {
    this.sync();
    return [...this.emailLogs].sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }

  public addEmailLog(entry: Omit<EmailLogEntry, "id" | "sentAt">): EmailLogEntry {
    const newEntry: EmailLogEntry = {
      ...entry,
      id: `email-${Date.now()}`,
      sentAt: new Date().toISOString(),
    };
    this.emailLogs.unshift(newEntry);
    this.saveToFile();
    return newEntry;
  }

  public clearAll(): void {
    this.applications = [];
    this.agreements = [];
    this.loans = [];
    this.auditLogs = [];
    this.emailLogs = [];
    this.saveToFile();
  }
}

// Global Singleton Instance
declare global {
  // eslint-disable-next-line no-var
  var globalDataStore: DataStore | undefined;
}

export const dbStore: DataStore = global.globalDataStore || new DataStore();
if (process.env.NODE_ENV !== "production") {
  global.globalDataStore = dbStore;
}
