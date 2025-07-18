import React from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import HotelDetail from "../../../components/Hotel/HotelDetail";
import Room from "../../../components/Hotel/Room";
import MyMapHotel from "../../../components/Hotel/MyMapHotel";
import ReviewCustomers from "../../../components/Hotel/ReviewCustomers";

export default function HotelPageDetail() {
  return (
    <>
      <Header />
      <HotelDetail />
      <Room />
      <MyMapHotel />
      <ReviewCustomers />
      <Footer />
    </>
  );
}
