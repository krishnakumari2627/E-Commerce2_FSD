from flask import Blueprint, request
from app import db
from app.models.order import Address
from app.middleware.auth_middleware import token_required, customer_required
from app.utils.validators import validate_phone, validate_pincode
from app.utils.error_handlers import success_response, error_response

address_bp = Blueprint('addresses', __name__)


@address_bp.route('', methods=['GET'])
@token_required
@customer_required
def get_addresses(current_user):
    """Get user's addresses."""
    addresses = Address.query.filter_by(user_id=current_user.id)\
                             .order_by(Address.is_default.desc()).all()
    return success_response('Addresses retrieved', [a.to_dict() for a in addresses])


@address_bp.route('', methods=['POST'])
@token_required
@customer_required
def create_address(current_user):
    """Create a new address."""
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    required = ['full_name', 'phone', 'address_line', 'city', 'state', 'pincode']
    for field in required:
        if not data.get(field, '').strip():
            return error_response(f'{field.replace("_", " ").title()} is required')

    if not validate_phone(data['phone']):
        return error_response('Invalid phone number')
    if not validate_pincode(data['pincode']):
        return error_response('Invalid pincode. Must be 6 digits')

    # If this is the first address or marked default, unset other defaults
    if data.get('is_default', False):
        Address.query.filter_by(user_id=current_user.id, is_default=True)\
                     .update({'is_default': False})

    # First address is auto-default
    existing_count = Address.query.filter_by(user_id=current_user.id).count()
    is_default = data.get('is_default', existing_count == 0)

    address = Address(
        user_id=current_user.id,
        full_name=data['full_name'].strip(),
        phone=data['phone'].strip(),
        address_line=data['address_line'].strip(),
        city=data['city'].strip(),
        state=data['state'].strip(),
        pincode=data['pincode'].strip(),
        country=data.get('country', 'India').strip(),
        address_type=data.get('address_type', 'home'),
        is_default=is_default
    )
    db.session.add(address)
    db.session.commit()

    return success_response('Address added successfully', address.to_dict(), 201)


@address_bp.route('/<int:addr_id>', methods=['PUT'])
@token_required
@customer_required
def update_address(current_user, addr_id):
    """Update an address."""
    address = Address.query.filter_by(id=addr_id, user_id=current_user.id).first()
    if not address:
        return error_response('Address not found', 404)

    data = request.get_json()
    fields = ['full_name', 'phone', 'address_line', 'city', 'state', 'pincode', 'country', 'address_type']
    for field in fields:
        if field in data:
            setattr(address, field, data[field].strip())

    if 'is_default' in data and data['is_default']:
        Address.query.filter_by(user_id=current_user.id, is_default=True)\
                     .update({'is_default': False})
        address.is_default = True

    db.session.commit()
    return success_response('Address updated', address.to_dict())


@address_bp.route('/<int:addr_id>', methods=['DELETE'])
@token_required
@customer_required
def delete_address(current_user, addr_id):
    """Delete an address."""
    address = Address.query.filter_by(id=addr_id, user_id=current_user.id).first()
    if not address:
        return error_response('Address not found', 404)

    db.session.delete(address)
    db.session.commit()
    return success_response('Address deleted')
