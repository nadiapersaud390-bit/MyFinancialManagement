import React, { useState } from 'react';
import { Plus, Trash2, Check, X, List } from 'lucide-react';
import { useData } from '../context/DataContext';
import Modal, { FormInput, ActionButtons } from '../components/Modal';

export default function Lists() {
  const { lists, addList, updateList, deleteList } = useData();
  const [newListModal, setNewListModal] = useState(false);
  const [listName, setListName] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState('');

  const selected = lists.find(l => l.id === selectedId) || lists[0] || null;

  const createList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;
    await addList({ name: listName.trim(), items: [] });
    setListName('');
    setNewListModal(false);
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !newItem.trim()) return;
    const items = [...selected.items, { id: Date.now().toString(), text: newItem.trim(), checked: false }];
    await updateList(selected.id, { items });
    setNewItem('');
  };

  const toggleItem = async (itemId: string) => {
    if (!selected) return;
    const items = selected.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i);
    await updateList(selected.id, { items });
  };

  const deleteItem = async (itemId: string) => {
    if (!selected) return;
    const items = selected.items.filter(i => i.id !== itemId);
    await updateList(selected.id, { items });
  };

  const checkedCount = selected?.items.filter(i => i.checked).length || 0;

  return (
    <div className="p-6 max-w-[1000px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Lists</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your custom lists and checklists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lists sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-xl" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #2d3748' }}>
              <h2 className="font-semibold text-white text-sm">My Lists</h2>
              <button onClick={() => setNewListModal(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: '#10b981' }}>
                <Plus size={13} /> New
              </button>
            </div>
            {lists.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-sm p-4">
                <List size={24} className="mx-auto mb-2" />
                No lists yet
              </div>
            ) : (
              <div className="p-2">
                {lists.map(list => {
                  const done = list.items.filter(i => i.checked).length;
                  const total = list.items.length;
                  return (
                    <div key={list.id}
                      onClick={() => setSelectedId(list.id)}
                      className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all mb-1"
                      style={{ background: selected?.id === list.id ? '#10b981' + '20' : 'transparent', border: `1px solid ${selected?.id === list.id ? '#10b98140' : 'transparent'}` }}>
                      <div>
                        <div className="text-sm font-medium text-white">{list.name}</div>
                        <div className="text-xs text-gray-500">{done}/{total} done</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteList(list.id); if (selectedId === list.id) setSelectedId(null); }}
                        className="p-1 text-gray-600 hover:text-red-400 rounded transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* List items */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="rounded-xl" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2d3748' }}>
                <div>
                  <h2 className="font-semibold text-white">{selected.name}</h2>
                  <p className="text-xs text-gray-500">{checkedCount}/{selected.items.length} completed</p>
                </div>
                {selected.items.length > 0 && (
                  <div className="w-24 h-1.5 rounded-full bg-gray-700">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${selected.items.length > 0 ? (checkedCount / selected.items.length) * 100 : 0}%` }} />
                  </div>
                )}
              </div>

              <div className="p-5">
                <form onSubmit={addItem} className="flex gap-2 mb-4">
                  <input
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    placeholder="Add new item..."
                    className="flex-1 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ background: '#0f1117', border: '1px solid #374151' }}
                  />
                  <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#10b981' }}>
                    <Plus size={16} />
                  </button>
                </form>

                {selected.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 text-sm">Add items to get started</div>
                ) : (
                  <div className="space-y-2">
                    {selected.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg group" style={{ background: '#0f1117' }}>
                        <button onClick={() => toggleItem(item.id)}
                          className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                          style={{ borderColor: item.checked ? '#10b981' : '#374151', background: item.checked ? '#10b981' : 'transparent' }}>
                          {item.checked && <Check size={11} className="text-white" />}
                        </button>
                        <span className={`flex-1 text-sm ${item.checked ? 'line-through text-gray-500' : 'text-white'}`}>{item.text}</span>
                        <button onClick={() => deleteItem(item.id)} className="p-1 text-gray-700 hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {checkedCount > 0 && (
                  <button onClick={() => updateList(selected.id, { items: selected.items.filter(i => !i.checked) })}
                    className="mt-4 text-xs text-gray-500 hover:text-red-400 transition-colors">
                    Clear {checkedCount} completed item{checkedCount !== 1 ? 's' : ''}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl flex items-center justify-center py-20" style={{ background: '#1a1d24', border: '1px solid #2d3748' }}>
              <div className="text-center text-gray-600">
                <List size={32} className="mx-auto mb-3" />
                <p className="text-sm">Select a list or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {newListModal && (
        <Modal title="Create New List" onClose={() => setNewListModal(false)}>
          <form onSubmit={createList}>
            <FormInput label="List Name *" value={listName} onChange={e => setListName(e.target.value)} required placeholder="e.g. Grocery List, Shopping, Goals" autoFocus />
            <ActionButtons onCancel={() => setNewListModal(false)} submitLabel="Create List" />
          </form>
        </Modal>
      )}
    </div>
  );
}
