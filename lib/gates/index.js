// Gate orchestrator - runs all gates and aggregates results

export class GateOrchestrator {
  constructor(gates) {
    this.gates = gates;
  }

  async checkCareer(student, career) {
    const results = [];
    
    for (const gate of this.gates) {
      const result = await gate.check(student, career);
      if (result.blocked || result.severity === 'WARNING') {
        results.push({
          gateName: gate.name,
          ...result
        });
      }
    }

    return {
      blocked: results.some(r => r.blocked),
      warnings: results.filter(r => r.severity === 'WARNING'),
      criticalBlocks: results.filter(r => r.blocked),
      allResults: results
    };
  }

  async filterCareers(student, careers) {
    const results = await Promise.all(
      careers.map(async career => ({
        career,
        gateResult: await this.checkCareer(student, career)
      }))
    );

    return {
      eligible: results.filter(r => !r.gateResult.blocked).map(r => r.career),
      blocked: results.filter(r => r.gateResult.blocked),
      stats: {
        total: careers.length,
        eligible: results.filter(r => !r.gateResult.blocked).length,
        blocked: results.filter(r => r.gateResult.blocked).length
      }
    };
  }
}
