
import React from 'react';
import { ShiftType } from './types';

export const SHIFT_CONFIG: Record<ShiftType, { 
  bg: string; 
  text: string; 
  label: string; 
  timeRange: string;
  dotColor: string;
}> = {
  Morning: {
    bg: 'bg-[#e3f2fd]',
    text: 'text-[#1565c0]',
    label: 'Morning',
    timeRange: '08:00 - 16:00',
    dotColor: 'bg-blue-500'
  },
  Afternoon: {
    bg: 'bg-[#e8f5e9]',
    text: 'text-[#2e7d32]',
    label: 'Afternoon',
    timeRange: '16:00 - 00:00',
    dotColor: 'bg-green-500'
  },
  Night: {
    bg: 'bg-[#f3e5f5]',
    text: 'text-[#7b1fa2]',
    label: 'Night',
    timeRange: '00:00 - 08:00',
    dotColor: 'bg-purple-500'
  },
  OFF: {
    bg: 'bg-[#f5f5f5]',
    text: 'text-[#757575]',
    label: 'OFF',
    timeRange: 'OFF',
    dotColor: 'bg-gray-400'
  }
};

export const STAFF_DATA = [
  {
    id: 's1',
    name: 'K. Manee',
    role: 'Senior RN',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_nKnQeOYqkzLHtP2oZaJWwYOiGaUxzbE5BsPA_etYPnZAAQ05fnbewLyGryY-m1_RuYAtS_KkgzSojWME3JGL43COLffw6vcKYJDE_V4O_PqQKNXk82A4eMkWaZbgYybHGI2tZgEabmW79WdlbF4M9o2hjENjKQi-7xHF5Cqu4HUo8DbY9asQucJFtJShilwNx8l4rzbTG0VWbtoZbRLinIuica1FXI5LC1GupdJmctfUhQk-s9sSK3LEMn7i2cxNRxHqZKpnb_y1',
    status: 'online' as const
  },
  {
    id: 's2',
    name: 'S. Chaiya',
    role: 'Junior RN',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT8dzxad-TpxNAzEvs1kGhPIV0Oe_-kS5F7CQexJJ37zJZo9Bt90T5srboLQ8nSU-X339PiySVkM_RRhBEAE5iyxZrqXMj1dpSEMIsIaFGtM31fTC3kIgUY9-osNLwF03a9Cn3jD-0sMGcQn2F8KIzdIa9E9iPWzqwBhj717vh9phA2zt64w8Huj5drvYwlR4GHkxRpy4XWsZMQONFzJJZoeTYJyztBj0nIrsUXXoWf_4RoM7yGZdhbCKBa0lTGdvKGyT4tzph-s88',
    status: 'offline' as const
  },
  {
    id: 's3',
    name: 'W. Prasert',
    role: 'Nursing Assistant',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoRCHMtRc51c-sV9NPZ41AD46Ss1wgjvgeJSqoCYUPhY-n_fjM3wYgf22DRkgxJYlKGYblxH6eXNP-ZrMFFNfABef1Ka4_OmMjw7JKFcYUYZbFWuyF_CJAfC1MdO2aUw-Bgh3DTrbtiUye1ZJ2C75hpG301-te0Y4FPrbGyK9VnS5q4qxUaekkTKSB1-iKEQEYVGkjUdoErPjXITY_nR-pABpPC5QIjkgcC0jmAiBNOj9MzNjM_IakPhwhtjkEw1uTYbk4ZpmK5M93',
    status: 'offline' as const
  },
  {
    id: 's4',
    name: 'T. Ananda',
    role: 'RN',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwXGiAIJ3KzHoonotYE32J742pKsK9UTRfWZfQ-iFc2GZL1-oEOzl7XgtAgHQo8NwU47H0Zmlr-3O2fLsQNrE11P5e9SWoW1O7BiSx4cPd-xHzypGX25Laai4xC2oqm1ambwl4oeLp1qD7gFu-fc4bKSO-7TVuhV4sH4ISehJHuFVSnDk4l4SXnQpq9k7c8qzOCJkkLTEpDl6_La2HIGIqrtBVLrkuM9ix__oHxQmokEHyxN9fLxeP10QctLHsb5taj91SYoPF7D30',
    status: 'offline' as const
  },
  {
    id: 's5',
    name: 'J. Malai',
    role: 'Junior RN',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeLVlgYJlaOiYbyWzeG7jMqVDVzfh_XkpFust-2bV9xd_t-mcKML71ag_0Bln9hHx2oWcD1bZPfdkYbx2nMwm2887EslzLdQMtZ142tI-AUzm1RwQPoFZ4yi4qbv_bb8e1S4n1VzspFSkXjZFLVt5lhfoeBIQ25iKiJmjOj6wV1uriCUEtBXxG8eBl2Yz9Syr5tGbV6c1V_Cc87wuukin6Ng8rtJITjvT9ufdhziDuCdWoT3wFy8V9i20w-R-ejYyzv_iC07dBzADH',
    status: 'offline' as const
  }
];
