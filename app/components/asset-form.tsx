"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { AssetFormData } from "@/app/types";

interface AssetFormProps {
  onSubmit: (data: AssetFormData) => void;
  onCancel: () => void;
  initialData?: AssetFormData;
  isLoading?: boolean;
}

const ASSET_TYPES = [
  { value: "cash", label: "現金" },
  { value: "stock", label: "株式" },
  { value: "bond", label: "債券" },
  { value: "fund", label: "投資信託" },
  { value: "deposit", label: "預金" },
  { value: "other", label: "その他" },
];

const UNITS = [
  { value: "円", label: "円" },
  { value: "株", label: "株" },
  { value: "口", label: "口" },
  { value: "枚", label: "枚" },
  { value: "本", label: "本" },
];

export function AssetForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}: AssetFormProps) {
  const [formData, setFormData] = useState<AssetFormData>(
    initialData || {
      name: "",
      type: "cash",
      amount: 0,
      unit: "円",
      description: "",
    }
  );

  const [errors, setErrors] = useState<{
    name?: string;
    type?: string;
    amount?: string;
    unit?: string;
    description?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      type?: string;
      amount?: string;
      unit?: string;
      description?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = "資産名は必須です";
    }

    if (!formData.type) {
      newErrors.type = "資産タイプは必須です";
    }

    if (formData.amount === undefined || formData.amount < 0) {
      newErrors.amount = "金額は0以上である必要があります";
    }

    if (!formData.unit.trim()) {
      newErrors.unit = "単位は必須です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof AssetFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">資産名 *</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="例: 普通預金、トヨタ自動車株式"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="type">資産タイプ *</Label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => handleInputChange("type", e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.type ? "border-red-500" : "border-gray-300"
          }`}
        >
          {ASSET_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="text-red-500 text-sm mt-1">{errors.type}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">金額・数量 *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
            placeholder="0"
            className={errors.amount ? "border-red-500" : ""}
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>

        <div>
          <Label htmlFor="unit">単位 *</Label>
          <select
            id="unit"
            value={formData.unit}
            onChange={(e) => handleInputChange("unit", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.unit ? "border-red-500" : "border-gray-300"
            }`}
          >
            {UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
          {errors.unit && (
            <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">説明・備考</Label>
        <textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="資産に関する詳細情報や備考を入力してください"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "保存中..." : initialData ? "更新" : "追加"}
        </Button>
      </div>
    </form>
  );
}
