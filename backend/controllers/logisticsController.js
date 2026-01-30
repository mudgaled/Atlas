const mongoose = require('mongoose');

// @desc    Get logistics/shipping information
// @route   GET /api/logistics
// @access  Public
const getLogisticsInfo = async (req, res) => {
  try {
    // This would normally connect to a logistics API or database
    // For now, we'll return mock data that fits the UI requirements
    
    // Mock data for logistics information
    const logisticsData = {
      shippingRates: [
        {
          carrier: 'Maersk',
          route: 'Singapore to Los Angeles',
          transitTime: '14 days',
          rate: 2500,
          currency: 'USD',
          lastUpdated: new Date()
        },
        {
          carrier: 'CMA CGM',
          route: 'Rotterdam to New York',
          transitTime: '12 days',
          rate: 2200,
          currency: 'USD',
          lastUpdated: new Date()
        },
        {
          carrier: 'MSC',
          route: 'Hong Kong to Hamburg',
          transitTime: '16 days',
          rate: 2800,
          currency: 'USD',
          lastUpdated: new Date()
        }
      ],
      portCirculars: [
        {
          port: 'Singapore',
          notice: 'New customs regulation effective Jan 15',
          effectiveDate: '2025-01-15',
          description: 'All electronics exports require additional documentation'
        },
        {
          port: 'Los Angeles',
          notice: 'Terminal maintenance scheduled',
          effectiveDate: '2025-01-20',
          description: 'Reduced capacity expected for 3 days'
        }
      ],
      customsRequirements: [
        {
          country: 'United States',
          requirement: 'ISF Filing',
          deadline: '24 hours before arrival',
          description: 'Importer Security Filing required for all ocean shipments'
        },
        {
          country: 'European Union',
          requirement: 'EORI Number',
          deadline: 'Before shipment',
          description: 'Economic Operators Registration and Identification required'
        }
      ]
    };

    res.json({
      success: true,
      data: logisticsData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Plan a shipment
// @route   POST /api/logistics/plan
// @access  Private
const planShipment = async (req, res) => {
  try {
    const { origin, destination, weight, dimensions, commodityType } = req.body;

    // Validate required fields
    if (!origin || !destination || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Origin, destination, and weight are required'
      });
    }

    // Mock calculation for shipment planning
    const shipmentOptions = [
      {
        id: 'option-1',
        carrier: 'Maersk',
        service: 'Ocean Freight',
        transitTime: '14 days',
        estimatedCost: 2500,
        currency: 'USD',
        route: `${origin} to ${destination}`,
        carbonFootprint: 'Medium',
        insuranceIncluded: true
      },
      {
        id: 'option-2',
        carrier: 'DHL',
        service: 'Express Air',
        transitTime: '5 days',
        estimatedCost: 4500,
        currency: 'USD',
        route: `${origin} to ${destination}`,
        carbonFootprint: 'High',
        insuranceIncluded: true
      },
      {
        id: 'option-3',
        carrier: 'FedEx',
        service: 'Standard Air',
        transitTime: '7 days',
        estimatedCost: 3200,
        currency: 'USD',
        route: `${origin} to ${destination}`,
        carbonFootprint: 'High',
        insuranceIncluded: false
      }
    ];

    res.json({
      success: true,
      data: {
        origin,
        destination,
        weight,
        options: shipmentOptions,
        recommendations: [
          'Consider ocean freight for cost savings',
          'Air freight recommended for urgent shipments',
          'Insurance recommended for valuable goods'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get port information
// @route   GET /api/logistics/ports/:portName
// @access  Public
const getPortInfo = async (req, res) => {
  try {
    const portName = req.params.portName.toLowerCase();
    
    // Mock port information
    const portInfo = {
      name: portName,
      country: 'Singapore',
      coordinates: { lat: 1.2647, lng: 103.8278 },
      facilities: ['Container Terminal', 'Bulk Cargo', 'Ro-Ro', 'Cruise'],
      operatingHours: '24/7',
      timezone: 'SGT (UTC+8)',
      contact: {
        phone: '+65 6377 6111',
        email: 'info@psa.com.sg'
      },
      currentStatus: 'Operational',
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: portInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getLogisticsInfo,
  planShipment,
  getPortInfo
};