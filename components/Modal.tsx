import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #2d3748' }}>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export const inputCls = 'w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';
export const inputStyle = { background: '#0f1117', border: '1px solid #374151' };
export const labelCls = 'block text-sm text-gray-400 mb-1';

interface FieldProps {
  label: string;
  children: React.ReactNode;
}
export function Field({ label, children }: FieldProps) {
  return (
    <div className="mb-4">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
export function FormInput({ label, ...props }: FormInputProps) {
  return (
    <Field label={label}>
      <input className={inputCls} style={inputStyle} {...props} />
    </Field>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}
export function FormSelect({ label, options, ...props }: FormSelectProps) {
  return (
    <Field label={label}>
      <select className={inputCls} style={inputStyle} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
export function FormTextarea({ label, ...props }: FormTextareaProps) {
  return (
    <Field label={label}>
      <textarea className={inputCls} style={inputStyle} rows={3} {...props} />
    </Field>
  );
}

interface ActionButtonsProps {
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
}
export function ActionButtons({ onCancel, onDelete, submitLabel = 'Save' }: ActionButtonsProps) {
  return (
    <div className="flex gap-3 mt-6">
      {onDelete && (
        <button type="button" onClick={onDelete}
          className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors">
          Delete
        </button>
      )}
      <div className="flex-1" />
      <button type="button" onClick={onCancel}
        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors">
        Cancel
      </button>
      <button type="submit"
        className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors"
        style={{ background: '#10b981' }}>
        {submitLabel}
      </button>
    </div>
  );
}
