import type { AdminSettings } from '../types';

const ADMIN_DB_KEY = 'resumeMatcherAdminSettings';

const defaultSettings: AdminSettings = {
    indianBankDetails: 'HDFC Bank, Acct: 502000XXXX1234, IFSC: HDFC0001234',
    indianUpiId: 'owner@okhdfcbank',
    usBankDetails: 'Bank of America, Acct: 4460123456