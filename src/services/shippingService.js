const env = require('../config/env');

async function createLabel({ fromAddress, toAddress, parcel }) {
  // Shippo integration
  const resp = await fetch('https://api.goshippo.com/shipments/', {
    method: 'POST',
    headers: {
      'Authorization': `ShippoToken ${env.shippoApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address_from: fromAddress,
      address_to: toAddress,
      parcels: [parcel || { length: '30', width: '20', height: '10', distance_unit: 'cm', weight: '1', mass_unit: 'kg' }],
      async: false,
    }),
  });
  const shipment = await resp.json();

  // Get cheapest rate
  if (shipment.rates && shipment.rates.length > 0) {
    const cheapest = shipment.rates.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))[0];

    // Purchase label
    const labelResp = await fetch('https://api.goshippo.com/transactions/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${env.shippoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rate: cheapest.object_id, async: false }),
    });
    return labelResp.json();
  }

  throw new Error('No shipping rates available');
}

async function getTracking(carrier, trackingNumber) {
  const resp = await fetch(`https://api.goshippo.com/tracks/${carrier}/${trackingNumber}`, {
    headers: { 'Authorization': `ShippoToken ${env.shippoApiKey}` },
  });
  return resp.json();
}

module.exports = { createLabel, getTracking };
