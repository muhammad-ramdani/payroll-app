<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmployeeAttendance;
use Illuminate\Database\Seeder;

class EmployeeAttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();
        $startDate = now()->startOfMonth();
        $endDate   = now();
        $period    = \Carbon\CarbonPeriod::create($startDate, $endDate);

        foreach ($period as $date) {
            foreach ($employees as $employee) {
                $isToday = $date->isToday();

                EmployeeAttendance::create([
                    'employee_id' => $employee->id,
                    'date'        => $date->toDateString(),
                    'clock_in'    => $isToday ? null : $date->copy()->setTime(9, 0)->toTimeString(),   // "09:00:00"
                    'clock_out'   => $isToday ? null : $date->copy()->setTime(17, 0)->toTimeString(),  // "17:00:00"
                    'status'      => $isToday ? 'not_started' : 'finished',
                ]);
            }
        }
    }
}


// class EmployeeAttendanceSeeder extends Seeder
// {
//     public function run(): void
//     {
//         $employees = Employee::all();
//         $startDate = now()->startOfMonth();
//         $endDate = now();

//         // Membuat array berisi semua tanggal dari awal bulan sampai hari ini
//         $period = \Carbon\CarbonPeriod::create($startDate, $endDate);

//         foreach ($period as $date) {
//             foreach ($employees as $employee) {
//                 $isToday = $date->isToday();

//                 EmployeeAttendance::create([
//                     'employee_id' => $employee->id,
//                     'date' => $date->toDateString(),
//                     'clock_in' => $isToday ? null : $date->copy()->setTime(9, 0), // Jam masuk 09:00
//                     'clock_out' => $isToday ? null : $date->copy()->setTime(17, 0), // Jam pulang 17:00 (8 jam)
//                     'status' => $isToday ? 'not_started' : 'finished',
//                 ]);
//             }
//         }
//     }
// }
