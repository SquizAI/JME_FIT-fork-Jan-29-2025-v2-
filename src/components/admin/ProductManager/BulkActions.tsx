import React from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, Archive, Trash2 } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onAction: (action: string) => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({ selectedCount, onAction }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-black p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {selectedCount} products selected
        </span>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction('updatePrice')}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            Update Price
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction('updateStock')}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <Package className="w-4 h-4" />
            Update Stock
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction('archive')}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <Archive className="w-4 h-4" />
            Archive
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction('delete')}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;