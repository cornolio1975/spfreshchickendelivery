import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        let order = body.order;
        let shopName = body.shopName || 'Default Shop';

        if (!order && body.orderId) {
            console.log(`[API Notification] Fetching details for Order ID: ${body.orderId}`);

            // Fetch the order from Supabase
            const { data: dbOrder, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', body.orderId)
                .single();

            if (orderError || !dbOrder) {
                console.error('[API Notification] Error fetching order:', orderError);
                return NextResponse.json(
                    { message: 'Order not found', error: orderError?.message },
                    { status: 404 }
                );
            }
            order = dbOrder;

            // Fetch shop name if shop_id is present
            if (order.shop_id) {
                const { data: shop, error: shopError } = await supabase
                    .from('shops')
                    .select('name')
                    .eq('id', order.shop_id)
                    .single();

                if (!shopError && shop) {
                    shopName = shop.name;
                }
            }
        }

        if (!order) {
            return NextResponse.json(
                { message: 'Order data or Order ID is required' },
                { status: 400 }
            );
        }

        // Prepare variables
        const orderNo = order.order_no;
        const total = parseFloat(order.total || '0');
        const deliveryFee = parseFloat(order.delivery_fee || '0');
        const subtotal = total - deliveryFee;

        // Parse items (handle JSONB)
        const items = Array.isArray(order.items) ? order.items : [];
        let itemsListText = '';
        items.forEach((item: any, index: number) => {
            const itemName = item.name || 'Unknown Item';
            const itemOption = item.option ? ` (${item.option})` : '';
            const qty = item.quantity || 1;
            const price = parseFloat(item.price || '0');
            const itemTotal = qty * price;
            itemsListText += `${index + 1}. ${itemName}${itemOption}\n   ${qty} x RM ${price.toFixed(2)} = RM ${itemTotal.toFixed(2)}\n`;
        });

        // Format date if scheduled
        let scheduledText = 'N/A (Immediate Delivery)';
        if (order.delivery_type === 'scheduled' && order.scheduled_at) {
            try {
                const dateObj = new Date(order.scheduled_at);
                scheduledText = dateObj.toLocaleString('en-MY', {
                    timeZone: 'Asia/Kuala_Lumpur',
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (dateErr) {
                scheduledText = order.scheduled_at;
            }
        }

        const accessKey = process.env.WEB3FORMS_ACCESS_KEY || 'c5a10abe-f44d-4303-90cb-6a41b3480836';

        // Prepare JSON payload for Web3Forms
        const web3formsPayload = {
            access_key: accessKey,
            subject: `New Order #${orderNo} - SP Fresh Chicken Delivery`,
            from_name: 'SP Fresh Chicken Delivery',
            name: order.recipient_name || 'Customer',
            email: order.recipient_phone ? `${order.recipient_phone}@spfreshchickendelivery.com` : 'no-reply@spfreshchickendelivery.com',
            
            // Custom Fields that will show up in the structured email table
            'Order Number': `#${orderNo}`,
            'Shop Name': shopName,
            'Customer Name': order.recipient_name || 'N/A',
            'Customer Phone': order.recipient_phone || 'N/A',
            'Delivery Address': order.delivery_address || 'N/A',
            'Unit / Floor / Remarks': order.room_floor_info || 'N/A',
            'Delivery Type': order.delivery_type === 'scheduled' ? 'Scheduled Future' : 'Order Now (Immediate)',
            'Scheduled Time': scheduledText,
            'Subtotal': `RM ${subtotal.toFixed(2)}`,
            'Delivery Fee': `RM ${deliveryFee.toFixed(2)}`,
            'Total Amount': `RM ${total.toFixed(2)}`,
            
            // Text Message block
            message: `Order Items Summary:\n\n${itemsListText}\n`
        };

        console.log('[API Notification] Sending submission payload to Web3Forms...');

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(web3formsPayload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('[API Notification] Web3Forms Email Sent Successfully:', data.message);
            return NextResponse.json({ success: true, message: data.message });
        } else {
            console.error('[API Notification] Web3Forms Error Response:', data);
            return NextResponse.json(
                { success: false, message: data.message || 'Web3Forms submission failed' },
                { status: response.status }
            );
        }

    } catch (error: any) {
        console.error('[API Notification] Unhandled Error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
