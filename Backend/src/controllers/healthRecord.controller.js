const catchAsync = require('../utils/catchAsync');
const healthRecordService = require('../services/healthRecord.service');

function sendList(res, items) {
  return res.status(200).json({ status: 'success', results: items.length, data: { items } });
}

function sendItem(res, key, item, statusCode = 200) {
  return res.status(statusCode).json({ status: 'success', data: { [key]: item } });
}

/**
 * Lists records for a pet.
 */
const listRecords = catchAsync(async (req, res) => {
  const records = await healthRecordService.listRecords(req.user, req.params.petId);
  sendList(res, records);
});

/**
 * Adds a manual health record.
 */
const addManualRecord = catchAsync(async (req, res) => {
  const record = await healthRecordService.addManualRecord(req.user, req.params.petId, req.body);
  sendItem(res, 'record', record, 201);
});

/**
 * Updates a health record.
 */
const updateRecord = catchAsync(async (req, res) => {
  const record = await healthRecordService.updateRecord(req.user, req.params.petId, req.params.id, req.body);
  sendItem(res, 'record', record);
});

/**
 * Deletes a health record.
 */
const deleteRecord = catchAsync(async (req, res) => {
  await healthRecordService.deleteRecord(req.user, req.params.petId, req.params.id);
  res.status(204).send();
});

/**
 * Downloads a PDF health summary.
 */
const downloadSummary = catchAsync(async (req, res) => {
  const pdfBuffer = await healthRecordService.generateSummaryPdf(req.user, req.params.petId);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="pet-health-summary-${req.params.petId}.pdf"`);
  res.status(200).send(pdfBuffer);
});

module.exports = { listRecords, addManualRecord, updateRecord, deleteRecord, downloadSummary };