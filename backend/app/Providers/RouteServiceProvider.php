<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

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

    RateLimiter::for('api', function ($request) {
        return Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip());
    });

    Route::middleware('web')
        ->group(base_path('routes/web.php'));
}

}

