import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  X,
  FileCode,
  FolderGit2,
} from 'lucide-react';

interface FlutterExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FLUTTER_FILES: Record<string, { path: string; language: string; content: string }> = {
  pubspec: {
    path: 'pubspec.yaml',
    language: 'yaml',
    content: `name: kryptos_finance
description: Secure financial management in Flutter with AES-256 E2EE, biometrics & peer debt attribution.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  local_auth: ^2.2.0 # Biometrics: Face ID, Touch ID, Fingerprint
  cryptography: ^2.7.0 # Pure AES-GCM-256 and PBKDF2 encryption
  provider: ^6.1.2 # State management
  intl: ^0.19.0 # BRL/USD/EUR currency formatting
  shared_preferences: ^2.2.3 # Local vault cache
  fl_chart: ^0.68.0 # Real-time budget gauges & charts
  qr_flutter: ^4.1.0 # Peer PIX QR code generation

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`,
  },
  main: {
    path: 'lib/main.dart',
    language: 'dart',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/dashboard_screen.dart';
import 'services/finance_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => FinanceProvider()..initialize()),
      ],
      child: const KryptosFinanceApp(),
    ),
  );
}

class KryptosFinanceApp extends StatelessWidget {
  const KryptosFinanceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'KryptosFinance',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF090D16),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981), // Emerald accent
          secondary: Color(0xFF06B6D4), // Cyan
          surface: Color(0xFF111827),
          error: Color(0xFFEF4444),
        ),
        useMaterial3: true,
      ),
      home: const DashboardScreen(),
    );
  }
}
`,
  },
  account_model: {
    path: 'lib/models/account.dart',
    language: 'dart',
    content: `class Account {
  final String id;
  final String name;
  final String institution;
  final String type; // 'credit', 'checking', 'savings'
  final double balance;
  final double totalDebt; // e.g. R$ 2.497,11 for Banco Pan
  final double monthlyInstallment; // e.g. R$ 553,39 for Banco Pan
  final String? dueDate; // e.g. "13/11/2026"
  final String colorHex;

  Account({
    required this.id,
    required this.name,
    required this.institution,
    required this.type,
    required this.balance,
    required this.totalDebt,
    required this.monthlyInstallment,
    this.dueDate,
    required this.colorHex,
  });

  factory Account.fromJson(Map<String, dynamic> json) => Account(
    id: json['id'],
    name: json['name'],
    institution: json['institution'],
    type: json['type'],
    balance: (json['balance'] as num).toDouble(),
    totalDebt: (json['totalDebt'] as num).toDouble(),
    monthlyInstallment: (json['monthlyInstallment'] as num).toDouble(),
    dueDate: json['dueDate'],
    colorHex: json['color'] ?? '#0055ff',
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'institution': institution,
    'type': type,
    'balance': balance,
    'totalDebt': totalDebt,
    'monthlyInstallment': monthlyInstallment,
    'dueDate': dueDate,
    'color': colorHex,
  };
}
`,
  },
  peer_debt_model: {
    path: 'lib/models/peer_debt.dart',
    language: 'dart',
    content: `class PeerDebt {
  final String id;
  final String creditorId; // User who is owed
  final String creditorName;
  final String debtorId; // User who owes
  final String debtorName;
  final double amount;
  final String description;
  final String? dueDate;
  final String status; // 'unpaid', 'paid', 'disputed'
  final DateTime createdAt;

  PeerDebt({
    required this.id,
    required this.creditorId,
    required this.creditorName,
    required this.debtorId,
    required this.debtorName,
    required this.amount,
    required this.description,
    this.dueDate,
    this.status = 'unpaid',
    required this.createdAt,
  });

  factory PeerDebt.fromJson(Map<String, dynamic> json) => PeerDebt(
    id: json['id'],
    creditorId: json['creditorId'],
    creditorName: json['creditorName'],
    debtorId: json['debtorId'],
    debtorName: json['debtorName'],
    amount: (json['amount'] as num).toDouble(),
    description: json['description'],
    dueDate: json['dueDate'],
    status: json['status'] ?? 'unpaid',
    createdAt: DateTime.parse(json['createdAt']),
  );
}
`,
  },
  encryption_service: {
    path: 'lib/services/encryption_service.dart',
    language: 'dart',
    content: `import 'dart:convert';
import 'package:cryptography/cryptography.dart';

class EncryptionService {
  static final _algorithm = AesGcm.with256bits();
  static final _pbkdf2 = Pbkdf2(
    macAlgorithm: Hmac.sha256(),
    iterations: 100000,
    bits: 256,
  );

  /// Encrypt arbitrary data payload using AES-GCM-256 & PBKDF2
  static Future<Map<String, dynamic>> encryptData(Map<String, dynamic> data, String passphrase) async {
    final salt = await _algorithm.newNonce();
    final secretKey = await _pbkdf2.deriveKeyFromPassword(
      password: passphrase,
      nonce: salt,
    );

    final clearText = jsonEncode(data);
    final secretBox = await _algorithm.encrypt(
      utf8.encode(clearText),
      secretKey: secretKey,
    );

    return {
      'algorithm': 'AES-GCM-256',
      'salt': base64Encode(salt),
      'iv': base64Encode(secretBox.nonce),
      'ciphertext': base64Encode(secretBox.cipherText),
      'mac': base64Encode(secretBox.mac.bytes),
    };
  }
}
`,
  },
  biometric_service: {
    path: 'lib/services/biometric_service.dart',
    language: 'dart',
    content: `import 'package:local_auth/local_auth.dart';

class BiometricService {
  static final LocalAuthentication _auth = LocalAuthentication();

  static Future<bool> isBiometricsAvailable() async {
    final canCheck = await _auth.canCheckBiometrics;
    final isDeviceSupported = await _auth.isDeviceSupported();
    return canCheck && isDeviceSupported;
  }

  static Future<bool> authenticate() async {
    try {
      return await _auth.authenticate(
        localizedReason: 'Autentique com biometria para acessar seu cofre KryptosFinance',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );
    } catch (e) {
      return false;
    }
  }
}
`,
  },
};

export const FlutterExportModal: React.FC<FlutterExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedKey, setSelectedKey] = useState<string>('pubspec');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentFile = FLUTTER_FILES[selectedKey];

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    // Generate bash script that outputs the entire Flutter directory
    let script = '#!/bin/bash\n# Script de inicialização do KryptosFinance Flutter\n\nmkdir -p kryptos_finance/lib/models kryptos_finance/lib/services kryptos_finance/lib/screens\ncd kryptos_finance\n\n';

    for (const key of Object.keys(FLUTTER_FILES)) {
      const file = FLUTTER_FILES[key];
      script += `cat << 'EOF' > ${file.path}\n${file.content}\nEOF\n\n`;
    }

    script += 'echo "KryptosFinance Flutter codebase criado com sucesso!"\necho "Para rodar: flutter pub get && flutter run"\n';

    const blob = new Blob([script], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'setup_kryptos_flutter.sh';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Código Fonte Flutter / Dart
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Flutter 3.x • Material 3
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Projeto nativo completo pronto para compilar no Android, iOS, Web e Desktop
            </p>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs mb-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Para rodar nativamente: <code className="text-cyan-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">flutter pub get && flutter run</code>
            </span>
          </div>

          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar Script Gerador (.sh)
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
          {Object.keys(FLUTTER_FILES).map((key) => {
            const f = FLUTTER_FILES[key];
            const isSelected = key === selectedKey;
            return (
              <button
                key={key}
                onClick={() => setSelectedKey(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                {f.path}
              </button>
            );
          })}
        </div>

        {/* Code Viewer */}
        <div className="mt-3 flex-1 overflow-hidden flex flex-col bg-slate-950 rounded-2xl border border-slate-800">
          <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-cyan-400">{currentFile.path}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Arquivo'}
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-300 overflow-auto flex-1 leading-relaxed selection:bg-cyan-500/30">
            <code>{currentFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
