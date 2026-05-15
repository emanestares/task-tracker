import { useState } from 'react';
import { TASK_STATUS, TASK_PRIORITY } from '../../constants';

const DEFAULT = {
  title: '',
  description: '',
  status: TASK_STATUS.TODO,
  priority: TASK_PRIORITY.MEDIUM,
  dueDate: '',
};

export default function TaskForm({
  initial = {},
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({ ...DEFAULT, ...initial });
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (form.title.length > 120)
      errs.title = 'Title must be under 120 characters.';
    if (form.description.length > 500)
      errs.description = 'Description must be under 500 characters.';

    if (!form.dueDate) {
      errs.dueDate = 'Due date is required.';
    } else {
      // ✅ NEW: prevent past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(form.dueDate);

      if (selectedDate < today) {
        errs.dueDate = 'Due date cannot be before today.';
      }
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      setErrors({});
      await onSubmit(form);
    } catch (err) {
      const backendErrors = err?.response?.data?.fields;

      if (backendErrors) {
        setErrors(backendErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="label">Title *</label>
        <input
          type="text"
          className={`input-field ${errors.title ? 'error' : ''}`}
          placeholder="e.g. Set up CI/CD pipeline"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          maxLength={120}
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea
          className={`input-field resize-none ${errors.description ? 'error' : ''}`}
          placeholder="Add more context about this task…"
          rows={3}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          maxLength={500}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-xs text-red-500">{errors.description}</p>
          ) : (
            <span />
          )}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {form.description.length}/500
          </p>
        </div>
      </div>

      {/* Status + Priority row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Status</label>
          <select
            className="input-field"
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
          >
            {Object.entries(TASK_STATUS).map(([k, v]) => (
              <option key={k} value={v}>
                {v === 'IN_PROGRESS'
                  ? 'In Progress'
                  : v.charAt(0) + v.slice(1).toLowerCase().replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Priority</label>
          <select
            className="input-field"
            value={form.priority}
            onChange={(e) => set('priority', e.target.value)}
          >
            {Object.entries(TASK_PRIORITY).map(([k, v]) => (
              <option key={k} value={v}>
                {v.charAt(0) + v.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due date */}
      <input
        type="date"
        className={`input-field ${errors.dueDate ? 'error' : ''}`}
        value={form.dueDate}
        onChange={(e) => set('dueDate', e.target.value)}
      />

      {errors.dueDate && (
        <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial?.id ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
