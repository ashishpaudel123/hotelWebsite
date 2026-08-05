// Booking DTOs

class CreateBookingDTO {
  constructor(data) {
    this.customerId = data.customerId;
    this.guestDetails = data.guestDetails;
    this.checkIn = new Date(data.checkIn);
    this.checkOut = new Date(data.checkOut);
    this.rooms = data.rooms;
    this.couponCode = data.couponCode;
    this.specialRequests = data.specialRequests;
    this.source = data.source || 'website';
    this.metadata = data.metadata;
  }

  validate() {
    if (!this.customerId) throw new Error('Customer ID is required');
    if (!this.guestDetails?.firstName || !this.guestDetails?.lastName) {
      throw new Error('Guest first name and last name are required');
    }
    if (!this.guestDetails?.email || !this.guestDetails?.phone) {
      throw new Error('Guest email and phone are required');
    }
    if (this.checkIn >= this.checkOut) {
      throw new Error('Check-out date must be after check-in date');
    }
    if (!Array.isArray(this.rooms) || this.rooms.length === 0) {
      throw new Error('At least one room is required');
    }
    return true;
  }
}

class AvailabilityCheckDTO {
  constructor(data) {
    this.checkIn = new Date(data.checkIn);
    this.checkOut = new Date(data.checkOut);
    this.roomTypeId = data.roomTypeId;
    this.quantity = data.quantity || 1;
  }

  validate() {
    if (!this.checkIn || !this.checkOut) {
      throw new Error('Check-in and check-out dates are required');
    }
    if (this.checkIn >= this.checkOut) {
      throw new Error('Check-out date must be after check-in date');
    }
    if (!this.roomTypeId) {
      throw new Error('Room type ID is required');
    }
    if (this.quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    return true;
  }
}

class CancelBookingDTO {
  constructor(data) {
    this.bookingId = data.bookingId;
    this.reason = data.reason;
    this.requestedBy = data.requestedBy;
  }

  validate() {
    if (!this.bookingId) throw new Error('Booking ID is required');
    if (!this.requestedBy) throw new Error('Requester ID is required');
    return true;
  }
}

class UpdateBookingStatusDTO {
  constructor(data) {
    this.bookingId = data.bookingId;
    this.status = data.status;
    this.reason = data.reason;
    this.updatedBy = data.updatedBy;
  }

  validate() {
    const validStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'failed'];
    if (!this.bookingId) throw new Error('Booking ID is required');
    if (!this.status || !validStatuses.includes(this.status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    if (!this.updatedBy) throw new Error('Updater ID is required');
    return true;
  }
}

module.exports = {
  CreateBookingDTO,
  AvailabilityCheckDTO,
  CancelBookingDTO,
  UpdateBookingStatusDTO
};
