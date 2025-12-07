import { useState, useMemo } from 'react';
import type { ViewComparison, TokenCostModel, CostComparison as CostComparisonType } from '../types';
import { calculateCost, formatNumber } from '../utils/tokenizer';
import tokenCosts from '../data/token-costs.json';
import './CostComparison.css';

interface CostComparisonProps {
  comparison: ViewComparison;
}

type FilterCategory = 'all' | 'flagship' | 'fast' | 'premium';

export function CostComparison({ comparison }: CostComparisonProps) {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set());

  const models = tokenCosts.models as TokenCostModel[];

  // Get unique providers
  const providers = useMemo(() => {
    return Array.from(new Set(models.map((m) => m.provider))).sort();
  }, [models]);

  // Calculate costs for each model
  const costComparisons = useMemo((): CostComparisonType[] => {
    return models
      .filter((model) => {
        if (selectedCategory !== 'all' && model.category !== selectedCategory) {
          return false;
        }
        if (selectedProviders.size > 0 && !selectedProviders.has(model.provider)) {
          return false;
        }
        return true;
      })
      .map((model) => {
        const machineViewCost = calculateCost(
          comparison.machineView.estimatedTokens,
          model.inputCostPerMToken
        );
        const htmlViewCost = calculateCost(
          comparison.htmlView.estimatedTokens,
          model.inputCostPerMToken
        );
        const savings = htmlViewCost - machineViewCost;
        const savingsPercent = htmlViewCost > 0 ? (savings / htmlViewCost) * 100 : 0;

        return {
          model,
          machineViewCost,
          htmlViewCost,
          savings,
          savingsPercent,
        };
      })
      .sort((a, b) => b.savings - a.savings); // Sort by highest savings first
  }, [models, selectedCategory, selectedProviders, comparison]);

  const toggleProvider = (provider: string) => {
    const newProviders = new Set(selectedProviders);
    if (newProviders.has(provider)) {
      newProviders.delete(provider);
    } else {
      newProviders.add(provider);
    }
    setSelectedProviders(newProviders);
  };

  const formatCost = (cost: number): string => {
    if (cost < 0.01) return '<$0.01';
    if (cost < 1) return `$${cost.toFixed(3)}`;
    return `$${cost.toFixed(2)}`;
  };

  return (
    <div className="cost-comparison">
      <div className="cost-header">
        <h4>Token Cost Comparison</h4>
        <p className="cost-description">
          Estimated cost savings for a single inference request using ARW vs HTML scraping
        </p>
      </div>

      <div className="cost-filters">
        <div className="filter-group">
          <label>Category:</label>
          <div className="filter-buttons">
            <button
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </button>
            <button
              className={selectedCategory === 'flagship' ? 'active' : ''}
              onClick={() => setSelectedCategory('flagship')}
            >
              Flagship
            </button>
            <button
              className={selectedCategory === 'fast' ? 'active' : ''}
              onClick={() => setSelectedCategory('fast')}
            >
              Fast
            </button>
            <button
              className={selectedCategory === 'premium' ? 'active' : ''}
              onClick={() => setSelectedCategory('premium')}
            >
              Premium
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>Providers:</label>
          <div className="filter-buttons provider-buttons">
            {providers.map((provider) => (
              <button
                key={provider}
                className={selectedProviders.has(provider) ? 'active' : ''}
                onClick={() => toggleProvider(provider)}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>
      </div>

      {costComparisons.length === 0 ? (
        <div className="empty-state">
          <p>No models match the selected filters</p>
        </div>
      ) : (
        <div className="cost-table-container">
          <table className="cost-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Provider</th>
                <th>Machine View Cost</th>
                <th>HTML Scrape Cost</th>
                <th>Savings</th>
                <th>% Saved</th>
              </tr>
            </thead>
            <tbody>
              {costComparisons.map((comp) => (
                <tr key={comp.model.id}>
                  <td className="model-name">
                    <div className="model-info">
                      <span className="model-title">{comp.model.model}</span>
                      {comp.model.note && <span className="model-note">{comp.model.note}</span>}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`provider-badge provider-${comp.model.provider.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {comp.model.provider}
                    </span>
                  </td>
                  <td className="cost-value">{formatCost(comp.machineViewCost)}</td>
                  <td className="cost-value">{formatCost(comp.htmlViewCost)}</td>
                  <td className="cost-savings">{formatCost(comp.savings)}</td>
                  <td className="percent-savings">
                    <span className="savings-badge">{comp.savingsPercent.toFixed(1)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="cost-footer">
        <div className="cost-summary">
          <div className="summary-item">
            <span className="summary-label">Machine View Tokens:</span>
            <span className="summary-value">
              {formatNumber(comparison.machineView.estimatedTokens)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">HTML Tokens:</span>
            <span className="summary-value">
              {formatNumber(comparison.htmlView.estimatedTokens)}
            </span>
          </div>
          <div className="summary-item highlight">
            <span className="summary-label">Token Reduction:</span>
            <span className="summary-value">
              {formatNumber(comparison.savings.absoluteTokens)} (
              {comparison.savings.tokenPercent.toFixed(1)}%)
            </span>
          </div>
        </div>
        <p className="disclaimer">
          <strong>Note:</strong> Token estimates are approximations (~4 chars/token). Actual costs
          vary by tokenizer and usage patterns. Prices current as of {tokenCosts.updated}.
        </p>
      </div>
    </div>
  );
}
