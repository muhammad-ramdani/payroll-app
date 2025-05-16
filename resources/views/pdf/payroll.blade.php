<!DOCTYPE html>
<html>
<head>
    <title>Slip Gaji {{ $payroll->user->name }} - {{ \Carbon\Carbon::create()->month($payroll->period_month)->translatedFormat('F') }} {{ $payroll->period_year }}</title>
    <style>
        body {
            font-family: sans-serif;
            padding: 0px 16px;
        }
        p, td, th {
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="margin-top: 0; text-transform: uppercase;">{{ $shopProfile->shop_name }}</h2>
        <p>
            {{ $shopProfile->address }}
            <br>
            No. Hp. {{ $shopProfile->phone }}
        </p>
        <h3 style="text-decoration: underline">SLIP GAJI BULANAN KARYAWAN</h3>
        <p>Periode: {{ \Carbon\Carbon::create()->month($payroll->period_month)->monthName }} {{ $payroll->period_year }}</p>
    </div>

    <table style="margin-bottom: 32px">
        <tr>
            <td>Nama</td>
            <td style="padding: 0px 8px">:</td>
            <td>{{ $payroll->user->name }}</td>
        </tr>
        <tr>
            <td>Nomor Handphone</td>
            <td style="padding: 0px 8px">:</td>
            <td>{{ $payroll->user?->employee?->phone ?: '-' }}</td>
        </tr>
        <tr>
            <td>Alamat</td>
            <td style="padding: 0px 8px">:</td>
            <td>{{ $payroll->user->employee->address ?: '-' }}</td>
        </tr>
    </table>

    {{-- <h4 style="margin: 15px 0; font-size: 16px;">Rincian Gaji</h4> --}}
    <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f5f5f5;">
            <th style="border: 1px solid #ddd; padding: 8px;">Komponen</th>
            <th style="border: 1px solid #ddd; padding: 8px;" colspan="3">Keterangan</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Jumlah</th>
        </tr>

        <tr>
            <td colspan="5" style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Pendapatan</td>
        </tr>
        
        <!-- Gaji Pokok -->
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Gaji Pokok</td>
            <td style="border-bottom: 1px solid #ddd; text-align: right">{{ $payroll->total_attendance_days + $payroll->paid_holidays }} Hari</td>
            <td style="border-bottom: 1px solid #ddd; text-align: center;">×</td>
            <td style="border-bottom: 1px solid #ddd; text-align: right; padding-right: 8px;">Rp {{ number_format($payroll->basic_salary, 0, ',', '.') }}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rp {{ number_format($payroll->total_basic_salary, 0, ',', '.') }}</td>
        </tr>

        <!-- Lembur -->
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Lembur</td>
            <td style="border-bottom: 1px solid #ddd; text-align: right">{{ $payroll->total_overtime_days }} Hari</td>
            <td style="border-bottom: 1px solid #ddd; text-align: center;">×</td>
            <td style="border-bottom: 1px solid #ddd; text-align: right; padding-right: 8px;">Rp {{ number_format($payroll->daily_overtime_pay, 0, ',', '.') }}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rp {{ number_format($payroll->total_overtime_pay, 0, ',', '.') }}</td>
        </tr>

        <!-- Bonus Tepat Waktu -->
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Bonus Tepat Waktu</td>
            <td style="border-bottom: 1px solid #ddd; text-align: right">{{ $payroll->total_punctual_days }} Hari</td>
            <td style="border-bottom: 1px solid #ddd; text-align: center;">×</td>
            <td style="border-bottom: 1px solid #ddd; text-align: right; padding-right: 8px;">Rp {{ number_format($payroll->bonus_amount, 0, ',', '.') }}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rp {{ number_format($payroll->total_bonus, 0, ',', '.') }}</td>
        </tr>

        <!-- Potongan Keterlambatan -->
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Potongan Keterlambatan</td>
            <td style="text-align: right">{{ $payroll->total_late_days }} Hari</td>
            <td style="text-align: center;">×</td>
            <td style="text-align: right; padding-right: 8px;">Rp {{ number_format($payroll->penalty_amount, 0, ',', '.') }}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #dc2626;">- Rp {{ number_format($payroll->total_penalty, 0, ',', '.') }}</td>
        </tr>

        <!-- Total Gaji Kotor -->
        <tr style="background-color: #f5f5f5;">
            <td colspan="4" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Total Gaji Kotor</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">Rp {{ number_format($payroll->gross_salary, 0, ',', '.') }}</td>
        </tr>

        <tr>
            <td colspan="5" style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Potongan</td>
        </tr>

        <!-- Total Potongan -->
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">BPJS Kesehatan</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;" colspan="2">{{ $payroll->bpjs_health_percent }}%</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;" rowspan="3">{{ $payroll->total_deduction_percent }}%</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #dc2626;" rowspan="3">- Rp {{ number_format($payroll->total_deductions, 0, ',', '.') }}</td>
        </tr>

        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">BPJS Ketenagakerjaan</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;" colspan="2">{{ $payroll->bpjs_employment_percent }}%</td>
        </tr>

        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Pajak Penghasilan</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;" colspan="2">{{ $payroll->income_tax_percent }}%</td>
        </tr>

        <!-- Gaji Bersih -->
        <tr style="background-color: #f5f5f5;">
            <td colspan="4" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Gaji Bersih</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">Rp {{ number_format($payroll->net_salary, 0, ',', '.') }}</td>
        </tr>
    </table>

    <table style="margin-top: 64px">
        <tr>
            <td style="vertical-align: top; padding-right: 128px;">
                @if($payroll->salary_status === 'paid_cash')
                    <p style="margin-top: 0px;">
                        Pembayarkan gaji telah dilakukan oleh Toko secara tunai ke {{ $payroll->user->name }}
                    </p>
                @elseif($payroll->salary_status === 'paid_transfer')
                    <p style="margin-top: 0px;">
                        Pembayarkan gaji telah dilakukan oleh Toko secara transfer ke rekening {{ $payroll->user->name }}
                        <br><br>
                        {{ $payroll->user->employee->bank_name }} - {{ $payroll->user->employee->account_number }} ({{ $payroll->user->employee->account_name }})
                    </p>
                @endif
            </td>
            <td>
                <div style="text-align: center;">
                    <p style="margin-top: 0px;">Mengetahui</p>
                    <div style="margin-top: 64px; white-space: nowrap;">
                        Pemilik Toko
                        <br>
                        ({{ $admin->name }})
                    </div>
                </div>
            </td>
        </tr>
    </table>
    <p style="position: absolute; bottom: 0px;">Tanggal Cetak: {{ now()->translatedFormat('l, d F Y H:i') }}</p>
</body>
</html>