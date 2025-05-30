<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Shift;
use Illuminate\Database\Seeder;
use Carbon\CarbonPeriod;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();
        $startDate = now()->startOfMonth()->subMonths(6);
        $endDate = now();
        $period = CarbonPeriod::create($startDate, $endDate);

        foreach ($period as $date) {
            $isToday = $date->isToday();
            $shiftMap = [];

            // Persiapan mapping shift untuk hari ini
            if ($isToday) {
                // Ambil data shift dari database
                $shifts = Shift::whereIn('user_id', $employees->pluck('user_id'))
                    ->get()
                    ->keyBy('user_id');
                
                foreach ($employees as $employee) {
                    $shiftMap[$employee->id] = $shifts[$employee->user_id]->shift_type ?? 'Pagi';
                }
            }

            foreach ($employees as $employee) {
                if ($isToday) {
                    Attendance::create([
                        'user_id' => $employee->user_id,
                        'shift_type' => $shiftMap[$employee->id],
                        'date' => $date->toDateString(),
                        'clock_in' => null,
                        'clock_out' => null,
                        'status' => 'not_started',
                    ]);
                    continue;
                }

                // Tentukan shift secara acak untuk hari-hari sebelumnya
                $shiftType = rand(0, 1) ? 'Pagi' : 'Siang';

                // Cek kemungkinan cuti 15%
                if (rand(1, 100) <= 10) {
                    Attendance::create([
                        'user_id' => $employee->user_id,
                        'shift_type' => $shiftType,
                        'date' => $date->toDateString(),
                        'clock_in' => null,
                        'clock_out' => null,
                        'status' => 'leave',
                    ]);
                    continue;
                } elseif (rand(1, 100) <= 5) {
                    Attendance::create([
                        'user_id' => $employee->user_id,
                        'shift_type' => $shiftType,
                        'date' => $date->toDateString(),
                        'clock_in' => null,
                        'clock_out' => null,
                        'status' => 'sick',
                    ]);
                    continue;
                }

                // Tentukan waktu datang dengan probabilitas
                $timeRand = rand(1, 100);
                $timeMod = 0;
                if ($timeRand <= 60) {
                    $timeMod = 0; // Tepat waktu
                } elseif ($timeRand <= 90) {
                    $timeMod = 1; // Sedikit terlambat
                } else {
                    $timeMod = 2; // Terlambat
                }

                // Set waktu berdasarkan shift
                if ($shiftType === 'Pagi') {
                    $clockIn = match ($timeMod) {
                        0 => '07:20:00',
                        1 => '07:10:00',
                        2 => '08:05:00',
                    };
                    $clockOut = '17:00:00';
                } else {
                    $clockIn = match ($timeMod) {
                        0 => '12:20:00',
                        1 => '12:10:00',
                        2 => '13:05:00',
                    };
                    $clockOut = '20:00:00';
                }

                Attendance::create([
                    'user_id' => $employee->user_id,
                    'shift_type' => $shiftType,
                    'date' => $date->toDateString(),
                    'clock_in' => $clockIn,
                    'clock_out' => $clockOut,
                    'status' => 'finished',
                ]);
            }
        }
    }
}