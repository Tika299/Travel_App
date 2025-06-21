<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use Database\Seeders\UsersTableSeeder;
use Database\Seeders\HotelsTableSeeder;
use Database\Seeders\HotelRoomsTableSeeder;
use Database\Seeders\LocationsTableSeeder;
use Database\Seeders\SpecialtiesTableSeeder;
use Database\Seeders\RestaurantsTableSeeder;
use Database\Seeders\DishesTableSeeder;
use Database\Seeders\TransportationsTableSeeder;
use Database\Seeders\TransportCompaniesTableSeeder;
use Database\Seeders\ItinerariesTableSeeder;
use Database\Seeders\ItineraryItemsTableSeeder;
use Database\Seeders\ReviewsTableSeeder;
use Database\Seeders\ReviewImagesTableSeeder;
use Database\Seeders\InteractionsTableSeeder;
use Database\Seeders\UserVisitedPlacesTableSeeder;
use Database\Seeders\RestaurantSpecialtyTableSeeder;
use Database\Seeders\ImagesTableSeeder;
use Database\Seeders\AmenitiesTableSeeder;
use Database\Seeders\AmenityHotelTableSeeder;
use Database\Seeders\AmenityHotelRoomTableSeeder;
use Database\Seeders\WeatherDataTableSeeder;
use Database\Seeders\ItineraryWeatherTableSeeder;
use Database\Seeders\CheckInPlacesTableSeeder; // Thêm seeder cho bảng checkin_places
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UsersTableSeeder::class,
            HotelsTableSeeder::class,
            HotelRoomsTableSeeder::class,
            LocationsTableSeeder::class,
            SpecialtiesTableSeeder::class,
            RestaurantsTableSeeder::class,//
            DishesTableSeeder::class,//
            TransportationsTableSeeder::class,
            TransportCompaniesTableSeeder::class,
            ItinerariesTableSeeder::class,
            ItineraryItemsTableSeeder::class,
            ReviewsTableSeeder::class,
            ReviewImagesTableSeeder::class,
            InteractionsTableSeeder::class,
            UserVisitedPlacesTableSeeder::class,
            RestaurantSpecialtyTableSeeder::class,
            ImagesTableSeeder::class,
            AmenitiesTableSeeder::class,
            AmenityHotelTableSeeder::class,
            AmenityHotelRoomTableSeeder::class,
            WeatherDataTableSeeder::class,
            ItineraryWeatherTableSeeder::class,
            CheckInPlacesTableSeeder::class
        ]);
    }
}
