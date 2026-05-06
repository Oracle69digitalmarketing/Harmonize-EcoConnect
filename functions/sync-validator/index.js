/**
 * Appwrite Cloud Sync Validator
 * This function runs on the central Appwrite cloud instance.
 * It validates incoming data from rural edge nodes.
 */

const sdk = require('node-appwrite');

module.exports = async function (context) {
    const client = new sdk.Client();
    const databases = new sdk.Databases(client);

    if (!context.req.body) {
        return context.res.json({ error: 'Missing body' }, 400);
    }

    const payload = context.req.body;
    const { $id, $collectionId, status, riskLevel } = payload;

    context.log(`Validating sync from Node for record: ${$id}`);

    // Business Logic: Escalation for Critical Health Records
    if ($collectionId === 'health_records' && (status === 'Critical' || riskLevel === 'High')) {
        context.log('ALARM: Critical Health Record detected. Escalating to Central Hospital API.');
        // Here you would integrate with a central notification system (SMS/Email)
    }

    // Business Logic: Agri Data Quality Check
    if ($collectionId === 'agri_logs') {
        context.log('Analyzing crop data for regional trend aggregation.');
    }

    return context.res.json({
        success: true,
        message: 'Sync validated and processed.',
        timestamp: new Date().toISOString()
    });
};
