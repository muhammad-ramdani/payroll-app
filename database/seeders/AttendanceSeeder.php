<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Attendance;
use Illuminate\Database\Seeder;
use Carbon\CarbonPeriod;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();
        $startDate = now()->startOfMonth()->subYear();
        $endDate = now();
        $period = CarbonPeriod::create($startDate, $endDate);

        foreach ($period as $date) {
            foreach ($employees as $employee) {
                $isToday = $date->isToday();

                if ($isToday) {
                    // Hari ini: status not_started tanpa jam
                    Attendance::create([
                        'user_id' => $employee->id,
                        'date' => $date->toDateString(),
                        'clock_in' => null,
                        'clock_out' => null,
                        'status' => 'not_started',
                    ]);
                } else {
                    // Generate skenario acak untuk hari-hari sebelumnya
                    $rand = rand(1, 100);

                    if ($rand <= 60) {
                        // 70% Shift 8 jam (09:00-17:00)
                        $clockIn = $date->copy()->setTime(9, 0);
                        $clockOut = $date->copy()->setTime(17, 0);
                        $status = 'finished';
                    } elseif ($rand <= 90) {
                        // 20% Shift 10 jam (08:00-18:00)
                        $clockIn = $date->copy()->setTime(8, 0);
                        $clockOut = $date->copy()->setTime(18, 0);
                        $status = 'finished';
                    } else {
                        // 10% Cuti
                        $clockIn = null;
                        $clockOut = null;
                        $status = 'leave';
                    }

                    Attendance::create([
                        'user_id' => $employee->id,
                        'date' => $date->toDateString(),
                        'clock_in' => $clockIn?->toTimeString(),
                        'clock_out' => $clockOut?->toTimeString(),
                        'status' => $status,
                    ]);
                }
            }
        }
    }
}