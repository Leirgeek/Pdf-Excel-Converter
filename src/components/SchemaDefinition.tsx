'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Field {
  id: string;
  name: string;
  type: 'text' | 'group';
  fields?: Field[];
}

const defaultSchema: Field[] = [
  { id: '1', name: 'company', type: 'text' },
  { id: '2', name: 'address', type: 'text' },
  { id: '3', name: 'total_sum', type: 'text' },
  {
    id: '4',
    name: 'items',
    type: 'group',
    fields: [
      { id: '4.1', name: 'item', type: 'text' },
      { id: '4.2', name: 'unit_price', type: 'text' },
      { id: '4.3', name: 'quantity', type: 'text' },
      { id: '4.4', name: 'sum', type: 'text' },
    ],
  },
];

export function SchemaDefinition() {
  const [schema, setSchema] = useState<Field[]>(defaultSchema);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['4']);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev =>
      prev.includes(id)
        ? prev.filter(groupId => groupId !== id)
        : [...prev, id]
    );
  };

  const addField = (parentId?: string) => {
    const newField: Field = {
      id: Date.now().toString(),
      name: '',
      type: 'text',
    };

    if (!parentId) {
      setSchema(prev => [...prev, newField]);
    } else {
      setSchema(prev => {
        const updateFields = (fields: Field[]): Field[] => {
          return fields.map(field => {
            if (field.id === parentId) {
              return {
                ...field,
                fields: [...(field.fields || []), newField],
              };
            }
            if (field.fields) {
              return {
                ...field,
                fields: updateFields(field.fields),
              };
            }
            return field;
          });
        };
        return updateFields(prev);
      });
    }
  };

  const removeField = (id: string) => {
    setSchema(prev => {
      const removeFromFields = (fields: Field[]): Field[] => {
        return fields
          .filter(field => field.id !== id)
          .map(field => {
            if (field.fields) {
              return {
                ...field,
                fields: removeFromFields(field.fields),
              };
            }
            return field;
          });
      };
      return removeFromFields(prev);
    });
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setSchema(prev => {
      const updateInFields = (fields: Field[]): Field[] => {
        return fields.map(field => {
          if (field.id === id) {
            return { ...field, ...updates };
          }
          if (field.fields) {
            return {
              ...field,
              fields: updateInFields(field.fields),
            };
          }
          return field;
        });
      };
      return updateInFields(prev);
    });
  };

  const renderField = (field: Field, depth = 0) => {
    const isExpanded = expandedGroups.includes(field.id);

    return (
      <div
        key={field.id}
        className={`pl-${depth * 4} py-2 space-y-2`}
        style={{ paddingLeft: `${depth * 1}rem` }}
      >
        <div className="flex items-center space-x-2">
          {field.type === 'group' && (
            <button
              onClick={() => toggleGroup(field.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          )}
          <input
            type="text"
            value={field.name}
            onChange={e => updateField(field.id, { name: e.target.value })}
            placeholder="Field name"
            className="flex-1 px-2 py-1 border rounded text-sm"
          />
          <select
            value={field.type}
            onChange={e =>
              updateField(field.id, {
                type: e.target.value as 'text' | 'group',
                fields: e.target.value === 'group' ? [] : undefined,
              })
            }
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="text">Text</option>
            <option value="group">Group</option>
          </select>
          <button
            onClick={() => removeField(field.id)}
            className="p-1 hover:bg-red-100 rounded text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {field.type === 'group' && isExpanded && (
          <div className="mt-2 space-y-2">
            {field.fields?.map(subField => renderField(subField, depth + 1))}
            <button
              onClick={() => addField(field.id)}
              className="ml-4 flex items-center space-x-1 text-sm text-blue-500 hover:text-blue-600"
            >
              <Plus className="h-4 w-4" />
              <span>Add Field</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Schema Definition</h2>
        <button
          onClick={() => addField()}
          className="flex items-center space-x-1 text-sm text-blue-500 hover:text-blue-600"
        >
          <Plus className="h-4 w-4" />
          <span>Add Field</span>
        </button>
      </div>
      <div className="border rounded-lg p-4 space-y-2">
        {schema.map(field => renderField(field))}
      </div>
    </div>
  );
}
