<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public const HOME = '/home';

    /**
     * Bootstrap services.
     */
public function boot(): void
{
    Route::prefix('api')->group(function () {
        Route::middleware('api')
            ->group(base_path('routes/api.php'));
    });

    Route::middleware('web')
        ->group(base_path('routes/web.php'));
}

}

