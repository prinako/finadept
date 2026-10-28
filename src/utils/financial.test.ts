import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  parseBrlCurrency,
  calculateTotalDebts,
  calculateMonthlyDebtCommitment,
  calculateNetWorth,
  calculateBudgetStatus,
  calculatePeerBalances,
  generateTaxSummary,
  parseBrazilianCsv,
} from './financial';
import { Account, Budget, PeerDebt, Transaction } from '../types/finance';

test('parseBrlCurrency parses Brazilian format numbers correctly', () => {
  assert.equal(parseBrlCurrency('R$ 2.497,11'), 2497.11);
  assert.equal(parseBrlCurrency('R$ 553,39'), 553.39);
  assert.equal(parseBrlCurrency('R$ 0,00'), 0);
  assert.equal(parseBrlCurrency(''), 0);
  assert.equal(parseBrlCurrency('10.500,50'), 10500.5);
});

test('parseBrazilianCsv accurately parses CSV from user attachment', () => {
  const sampleCsv = `Santander,,,Neon,,,Banco Pan,
Total ,"R$ 0,00",,Total ,"R$ 0,00",,Total ,"R$ 2.497,11"
Valor por mês,"R$ 0,00",,Valor por mês,"R$ 0,00",,Valor por mês,"R$ 553,39"
Data de vencimento,10/11/2026,,Data de vencimento,02/11/2026,,Data de vencimento,13/11/2026
,,,,,,,
Nubank,,,,,,,
Total ,"R$ 0,00",,,,,,
Valor por mês,"R$ 0,00",,,,,,
Data de vencimento,05/11/2026,,,,,,
,,,,,,,
O Valor Total em Dívidas,,,"R$ 2.497,11",,,,
O Valor Total em Dívidas Por mês,,,"R$ 553,39",,,,`;

  const accounts = parseBrazilianCsv(sampleCsv);
  assert.equal(accounts.length, 4);

  const bancoPan = accounts.find((a) => a.name === 'Banco Pan');
  assert.ok(bancoPan);
  assert.equal(bancoPan?.totalDebt, 2497.11);
  assert.equal(bancoPan?.monthlyInstallment, 553.39);
  assert.equal(bancoPan?.dueDate, '13/11/2026');

  const santander = accounts.find((a) => a.name === 'Santander');
  assert.ok(santander);
  assert.equal(santander?.totalDebt, 0);
  assert.equal(santander?.dueDate, '10/11/2026');

  const nubank = accounts.find((a) => a.name === 'Nubank');
  assert.ok(nubank);
  assert.equal(nubank?.dueDate, '05/11/2026');
});

test('calculateTotalDebts and monthly commitments calculate accurate totals', () => {
  const accounts: Account[] = [
    {
      id: '1',
      name: 'Banco Pan',
      institution: 'Banco Pan',
      type: 'credit',
      balance: 0,
      totalDebt: 2497.11,
      monthlyInstallment: 553.39,
      color: '#0055ff',
    },
    {
      id: '2',
      name: 'Santander',
      institution: 'Santander',
      type: 'credit',
      balance: 0,
      totalDebt: 0,
      monthlyInstallment: 0,
      color: '#ec0000',
    },
    {
      id: '3',
      name: 'Nubank Checking',
      institution: 'Nubank',
      type: 'checking',
      balance: 4500.0,
      totalDebt: 0,
      monthlyInstallment: 0,
      color: '#820ad1',
    },
  ];

  const totalDebts = calculateTotalDebts(accounts);
  assert.equal(totalDebts, 2497.11);

  const monthlyCommitment = calculateMonthlyDebtCommitment(accounts);
  assert.equal(monthlyCommitment, 553.39);

  const netWorth = calculateNetWorth(accounts);
  assert.equal(netWorth, 4500.0 - 2497.11);
});

test('calculatePeerBalances correctly sums peer debts', () => {
  const currentUserId = 'user-evellyn';
  const debts: PeerDebt[] = [
    {
      id: 'd1',
      creditorId: 'user-evellyn',
      creditorName: 'Evellyn',
      debtorId: 'user-carlos',
      debtorName: 'Carlos',
      amount: 150.0,
      description: 'Dinner split',
      status: 'unpaid',
      createdAt: '2026-10-01',
    },
    {
      id: 'd2',
      creditorId: 'user-lucas',
      creditorName: 'Lucas',
      debtorId: 'user-evellyn',
      debtorName: 'Evellyn',
      amount: 50.0,
      description: 'Concert ticket',
      status: 'unpaid',
      createdAt: '2026-10-02',
    },
    {
      id: 'd3',
      creditorId: 'user-evellyn',
      creditorName: 'Evellyn',
      debtorId: 'user-ana',
      debtorName: 'Ana',
      amount: 200.0,
      description: 'Uber',
      status: 'paid', // should be excluded because paid
      createdAt: '2026-09-10',
    },
  ];

  const balances = calculatePeerBalances(currentUserId, debts);
  assert.equal(balances.owedToMe, 150.0);
  assert.equal(balances.iOwe, 50.0);
  assert.equal(balances.netPeerBalance, 100.0);
});

test('generateTaxSummary aggregates deductible expenses and assets', () => {
  const transactions: Transaction[] = [
    {
      id: 't1',
      accountId: 'acc1',
      type: 'income',
      amount: 8000,
      category: 'Salary',
      description: 'Monthly Salary',
      date: '2026-03-05',
      status: 'cleared',
      isTaxDeductible: false,
      taxCategory: 'none',
    },
    {
      id: 't2',
      accountId: 'acc1',
      type: 'expense',
      amount: 1200,
      category: 'Healthcare',
      description: 'Health Insurance Plan',
      date: '2026-04-10',
      status: 'cleared',
      isTaxDeductible: true,
      taxCategory: 'health',
    },
    {
      id: 't3',
      accountId: 'acc1',
      type: 'expense',
      amount: 800,
      category: 'Education',
      description: 'University Tuition',
      date: '2026-05-15',
      status: 'cleared',
      isTaxDeductible: true,
      taxCategory: 'education',
    },
  ];

  const accounts: Account[] = [
    {
      id: 'acc1',
      name: 'Nubank',
      institution: 'Nubank',
      type: 'checking',
      balance: 15000,
      totalDebt: 0,
      monthlyInstallment: 0,
      color: '#820ad1',
    },
    {
      id: 'acc2',
      name: 'Banco Pan',
      institution: 'Banco Pan',
      type: 'credit',
      balance: 0,
      totalDebt: 2497.11,
      monthlyInstallment: 553.39,
      color: '#0055ff',
    },
  ];

  const tax = generateTaxSummary(transactions, accounts, 2026);
  assert.equal(tax.totalIncome, 8000);
  assert.equal(tax.totalExpenses, 2000);
  assert.equal(tax.totalDeductible, 2000);
  assert.equal(tax.deductionsByCategory.health, 1200);
  assert.equal(tax.deductionsByCategory.education, 800);
  assert.equal(tax.totalDebtsDeclared, 2497.11);
  assert.equal(tax.totalAssetsDeclared, 15000);
  assert.equal(tax.netTaxableBase, 6000);
});
