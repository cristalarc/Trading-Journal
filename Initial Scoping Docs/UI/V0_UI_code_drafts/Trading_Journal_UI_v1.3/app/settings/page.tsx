"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash } from "lucide-react"

type Attribute = {
  id: string
  name: string
  values: string[]
}

const initialAttributes: Attribute[] = [
  { id: "1", name: "Timeframe", values: ["Hourly", "Daily", "Weekly", "Monthly"] },
  { id: "2", name: "Pattern", values: ["Cup and Handle", "Head and Shoulders", "Flag", "Triangle"] },
  // Add other initial attributes here
]

export default function SettingsPage() {
  const [attributes, setAttributes] = useState<Attribute[]>(initialAttributes)
  const [newAttributeName, setNewAttributeName] = useState("")
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null)

  const handleAddAttribute = () => {
    if (newAttributeName.trim() !== "") {
      setAttributes([...attributes, { id: Date.now().toString(), name: newAttributeName, values: [] }])
      setNewAttributeName("")
    }
  }

  const handleEditAttribute = (attribute: Attribute) => {
    setEditingAttribute(attribute)
  }

  const handleUpdateAttribute = () => {
    if (editingAttribute) {
      setAttributes(attributes.map((attr) => (attr.id === editingAttribute.id ? editingAttribute : attr)))
      setEditingAttribute(null)
    }
  }

  const handleDeleteAttribute = (id: string) => {
    setAttributes(attributes.filter((attr) => attr.id !== id))
  }

  const handleAddValue = (attributeId: string, value: string) => {
    setAttributes(
      attributes.map((attr) => (attr.id === attributeId ? { ...attr, values: [...attr.values, value] } : attr)),
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Add New Attribute</h2>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={newAttributeName}
            onChange={(e) => setNewAttributeName(e.target.value)}
            placeholder="Enter attribute name"
          />
          <Button onClick={handleAddAttribute}>
            <Plus className="mr-2 h-4 w-4" /> Add Attribute
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Attribute</TableHead>
            <TableHead>Values</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attributes.map((attribute) => (
            <TableRow key={attribute.id}>
              <TableCell>{attribute.name}</TableCell>
              <TableCell>
                {editingAttribute?.id === attribute.id ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={editingAttribute.values.join(", ")}
                      onChange={(e) => setEditingAttribute({ ...editingAttribute, values: e.target.value.split(", ") })}
                    />
                    <Button onClick={handleUpdateAttribute}>Save</Button>
                  </div>
                ) : (
                  attribute.values.join(", ")
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditAttribute(attribute)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteAttribute(attribute.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

