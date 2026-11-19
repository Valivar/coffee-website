import { store } from './utils.js';

const KEY = 'chitchat.orders.v1';
export const TRACK = [
  ['Order placed', 0], ['Confirmed', 1], ['Roasting your beans', 5], ['Packed fresh', 30],
  ['Shipped', 180], ['Out for delivery', 2880], ['Delivered', 4320]
];
export const DEMO_SPEED = 60; // 1 real minute = 1 simulated hour

export const SHIP = {
  standard: { label: 'Standard delivery', eta: '3–5 business days', fee: sub => (sub >= 599 ? 0 : 60) },
  express: { label: 'Express delivery', eta: '1–2 business days', fee: () => 120 }
};

export const Orders = {
  all: () => store.get(KEY, []),
  find: id => Orders.all().find(o => o.id === String(id || '').trim().toUpperCase()),
  create(o) {
    const id = 'CC' + Math.floor(100000 + Math.random() * 900000);
    const order = { ...o, id, createdAt: Date.now() };
    store.set(KEY, [order, ...Orders.all()].slice(0, 25));
    return order;
  },
  stage(o) {
    const mins = (Date.now() - o.createdAt) / 60000 * DEMO_SPEED;
    let idx = 0; TRACK.forEach((t, i) => { if (mins >= t[1]) idx = i; });
    return idx;
  }
};
