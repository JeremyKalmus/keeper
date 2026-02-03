// API client for Keeper Dashboard

const API_BASE = '/api'

export interface VaultInfo {
  name: string
  file: string
}

export interface VaultContent {
  name: string
  content: Record<string, unknown>
}

export interface DecisionInfo {
  id: string
  file: string
  summary: string | null
}

export interface DecisionContent {
  id: string
  content: Record<string, unknown>
}

export async function fetchVaults(): Promise<VaultInfo[]> {
  const response = await fetch(`${API_BASE}/vaults`)
  if (!response.ok) throw new Error('Failed to fetch vaults')
  const data = await response.json()
  return data.vaults
}

export async function fetchVault(name: string): Promise<VaultContent> {
  const response = await fetch(`${API_BASE}/vault/${name}`)
  if (!response.ok) throw new Error(`Failed to fetch vault: ${name}`)
  return response.json()
}

export async function fetchDecisions(): Promise<DecisionInfo[]> {
  const response = await fetch(`${API_BASE}/decisions`)
  if (!response.ok) throw new Error('Failed to fetch decisions')
  const data = await response.json()
  return data.decisions
}

export async function fetchDecision(id: string): Promise<DecisionContent> {
  const response = await fetch(`${API_BASE}/decision/${id}`)
  if (!response.ok) throw new Error(`Failed to fetch decision: ${id}`)
  return response.json()
}
