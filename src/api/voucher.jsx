import axiosClient from "./axiosClient";

// Mock data for vouchers until backend is ready
const MOCK_VOUCHERS = [
  {
    id: 1,
    name: "Phiếu giảm giá Highlands Coffee 50k",
    description: "Áp dụng cho hóa đơn từ 100k",
    pointsRequired: 500,
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=500&auto=format&fit=crop",
    category: "Ẩm thực",
    expiryDays: 30
  },
  {
    id: 2,
    name: "Voucher GrabCar 30k",
    description: "Giảm 30k cho chuyến đi từ 60k",
    pointsRequired: 300,
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=500&auto=format&fit=crop",
    category: "Di chuyển",
    expiryDays: 15
  },
  {
    id: 3,
    name: "Thẻ cào điện thoại 20k",
    description: "Áp dụng cho tất cả nhà mạng",
    pointsRequired: 200,
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=500&auto=format&fit=crop",
    category: "Tiện ích",
    expiryDays: 365
  },
  {
    id: 4,
    name: "Túi vải Canvas bảo vệ môi trường",
    description: "Túi vải cao cấp thiết kế riêng",
    pointsRequired: 1000,
    image: "https://images.unsplash.com/photo-1544816153-12158008e7af?q=80&w=500&auto=format&fit=crop",
    category: "Quà tặng",
    expiryDays: 0
  }
];

export const getVouchers = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: MOCK_VOUCHERS });
    }, 500);
  });
};

export const redeemVoucher = async (voucherId) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Đổi quà thành công! Mã voucher đã được gửi vào hòm thư của bạn." });
    }, 1000);
  });
};

export const getMyVouchers = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: [] });
    }, 500);
  });
};
