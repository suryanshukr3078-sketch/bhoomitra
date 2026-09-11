export class LandGovernanceClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000/api/v1') {
    this.baseUrl = baseUrl;
  }

  async getHealth() {
    const res = await fetch(`${this.baseUrl}/health`);
    return res.json();
  }

  async listParcels() {
    const res = await fetch(`${this.baseUrl}/parcels/`);
    return res.json();
  }
}
