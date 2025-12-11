export type Seat = {
  id_cell: number;
  is_seat: boolean;
  x: number;
  y: number;
};

export type SeatMapData = {
  additional_seats_remaining: number;
  seats_number: number;
  seat_map: {
    class_name: string;
    cols: number;
    id_cell_block: number;
    id_class: number;
    rows: number;
    cells: Seat[];
  }[];
};
