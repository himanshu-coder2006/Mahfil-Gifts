import mongoose from 'mongoose';

const customizationFieldSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  label: { type: String, required: true },
  fieldType: {
    type: String,
    enum: ['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'DROPDOWN', 'RADIO', 'CHECKBOX', 'COLOR', 'FONT', 'IMAGE_UPLOAD', 'LOGO_UPLOAD', 'MULTIPLE_IMAGE_UPLOAD'],
    required: true,
  },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  minLength: { type: Number, default: 0 },
  maxLength: { type: Number, default: 200 },
  allowedCharacters: { type: String, default: '' },
  extraCharge: { type: Number, default: 0 },
  validation: { type: String, default: '' },
  helpText: { type: String, default: '' },
  displayOrder: { type: Number, default: 0 },
  options: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('CustomizationField', customizationFieldSchema);
