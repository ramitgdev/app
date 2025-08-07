// Enhanced AI IDE Demo Code Examples
// These examples showcase the AI-powered features of the Enhanced Web IDE

export const demoExamples = {
  // Basic JavaScript example for AI analysis
  basicJavaScript: `// Welcome to Enhanced AI IDE Demo!
// Try these AI features with this code:

class TaskManager {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
  }
  
  // Add a new task
  addTask(title, description) {
    const task = {
      id: this.nextId++,
      title: title,
      description: description,
      completed: false,
      createdAt: new Date()
    };
    this.tasks.push(task);
    return task;
  }
  
  // Complete a task
  completeTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = true;
      task.completedAt = new Date();
    }
    return task;
  }
  
  // Get all incomplete tasks
  getIncompleteTasks() {
    return this.tasks.filter(task => !task.completed);
  }
  
  // Get task statistics
  getStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const incomplete = total - completed;
    
    return {
      total,
      completed,
      incomplete,
      completionRate: total > 0 ? (completed / total * 100).toFixed(1) + '%' : '0%'
    };
  }
}

// Demo usage
const taskManager = new TaskManager();

// Add some tasks
taskManager.addTask("Learn AI IDE features", "Explore all the AI-powered capabilities");
taskManager.addTask("Build a project", "Create something awesome with AI assistance");
taskManager.addTask("Share with team", "Show the enhanced IDE to teammates");

// Complete first task
taskManager.completeTask(1);

// Log results
console.log("Incomplete tasks:", taskManager.getIncompleteTasks());
console.log("Statistics:", taskManager.getStats());

/* 
🚀 Try these AI features:
1. Select the TaskManager class and right-click → "🤖 Explain Code"
2. Select the getStats method and right-click → "⚡ Optimize Code"  
3. Select any function and right-click → "📝 Add Comments"
4. Ask the AI: "How can I improve this TaskManager class?"
5. Try typing "taskManager." and see AI completions!
*/`,

  // Python example for multi-language support
  pythonExample: `# Enhanced AI IDE - Python Demo
# AI-powered features work across multiple languages!

import datetime
from typing import List, Dict, Optional

class SmartBudgetTracker:
    """An intelligent budget tracking system with AI-enhanced features."""
    
    def __init__(self):
        self.transactions: List[Dict] = []
        self.categories: Dict[str, float] = {}
        self.monthly_budget: float = 0.0
    
    def set_monthly_budget(self, amount: float) -> None:
        """Set the monthly budget limit."""
        self.monthly_budget = amount
        print(f"Monthly budget set to ${amount:.2f}")
    
    def add_transaction(self, amount: float, category: str, description: str = "") -> Dict:
        """Add a new transaction to the budget tracker."""
        transaction = {
            'id': len(self.transactions) + 1,
            'amount': amount,
            'category': category.lower(),
            'description': description,
            'date': datetime.datetime.now(),
            'type': 'expense' if amount < 0 else 'income'
        }
        
        self.transactions.append(transaction)
        
        # Update category totals
        if category.lower() not in self.categories:
            self.categories[category.lower()] = 0
        self.categories[category.lower()] += amount
        
        return transaction
    
    def get_monthly_spending(self) -> float:
        """Calculate total spending for current month."""
        current_month = datetime.datetime.now().month
        current_year = datetime.datetime.now().year
        
        monthly_expenses = sum(
            t['amount'] for t in self.transactions 
            if (t['date'].month == current_month and 
                t['date'].year == current_year and 
                t['amount'] < 0)
        )
        
        return abs(monthly_expenses)
    
    def get_budget_status(self) -> Dict[str, any]:
        """Get current budget status and warnings."""
        spent = self.get_monthly_spending()
        remaining = self.monthly_budget - spent
        percentage_used = (spent / self.monthly_budget * 100) if self.monthly_budget > 0 else 0
        
        status = {
            'budget': self.monthly_budget,
            'spent': spent,
            'remaining': remaining,
            'percentage_used': round(percentage_used, 1),
            'warning': None
        }
        
        if percentage_used > 90:
            status['warning'] = "CRITICAL: Over 90% of budget used!"
        elif percentage_used > 75:
            status['warning'] = "WARNING: 75% of budget used"
        elif percentage_used > 50:
            status['warning'] = "NOTICE: 50% of budget used"
            
        return status
    
    def get_category_breakdown(self) -> Dict[str, Dict]:
        """Get spending breakdown by category."""
        breakdown = {}
        
        for category, total in self.categories.items():
            if total < 0:  # Only expenses
                breakdown[category] = {
                    'total': abs(total),
                    'percentage': abs(total) / self.get_monthly_spending() * 100 if self.get_monthly_spending() > 0 else 0,
                    'transaction_count': sum(1 for t in self.transactions if t['category'] == category and t['amount'] < 0)
                }
        
        return breakdown

# Demo usage
def main():
    budget = SmartBudgetTracker()
    
    # Set monthly budget
    budget.set_monthly_budget(2500.00)
    
    # Add some transactions
    budget.add_transaction(3000, 'salary', 'Monthly salary')
    budget.add_transaction(-800, 'rent', 'Monthly rent payment')
    budget.add_transaction(-150, 'groceries', 'Weekly grocery shopping')
    budget.add_transaction(-75, 'utilities', 'Electric and water bill')
    budget.add_transaction(-200, 'entertainment', 'Dinner and movie')
    budget.add_transaction(-50, 'transportation', 'Gas and parking')
    
    # Check budget status
    status = budget.get_budget_status()
    print("\\nBudget Status:")
    print(f"Budget: ${status['budget']:.2f}")
    print(f"Spent: ${status['spent']:.2f}")
    print(f"Remaining: ${status['remaining']:.2f}")
    print(f"Usage: {status['percentage_used']}%")
    
    if status['warning']:
        print(f"⚠️  {status['warning']}")
    
    # Category breakdown
    print("\\nCategory Breakdown:")
    breakdown = budget.get_category_breakdown()
    for category, data in breakdown.items():
        print(f"{category.title()}: ${data['total']:.2f} ({data['percentage']:.1f}%)")

if __name__ == "__main__":
    main()

"""
🐍 Python AI Features to Try:
1. Select the SmartBudgetTracker class → Right-click → "🤖 Explain Code"
2. Select get_budget_status method → Right-click → "⚡ Optimize Code"
3. Ask AI: "How can I add data visualization to this budget tracker?"
4. Select any method → Right-click → "🏗️ Refactor Code"
5. Try typing "budget." to see intelligent Python completions!
"""`,

  // Complex React component example
  reactExample: `// Enhanced AI IDE - React Component Demo
// Experience AI assistance with modern React development

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

const SmartSearchComponent = ({ data, onResultSelect, placeholder = "Search..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  // Memoized search function for performance
  const searchFunction = useMemo(() => {
    return debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Simulate API call or complex search logic
      const filteredResults = data.filter(item => {
        const searchTerm = searchQuery.toLowerCase();
        return (
          item.title?.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm) ||
          item.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      });

      // Sort by relevance (title matches first, then description, then tags)
      const sortedResults = filteredResults.sort((a, b) => {
        const aTitle = a.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const bTitle = b.title?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return 0;
      });

      setTimeout(() => {
        setResults(sortedResults.slice(0, 10)); // Limit to 10 results
        setIsLoading(false);
      }, 300); // Simulate network delay
    }, 300);
  }, [data]);

  // Handle search query changes
  const handleQueryChange = useCallback((e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSelectedIndex(-1);
    setIsOpen(true);
    searchFunction(newQuery);
  }, [searchFunction]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, results, selectedIndex]);

  // Handle result selection
  const handleResultSelect = useCallback((result) => {
    setQuery(result.title || '');
    setIsOpen(false);
    setSelectedIndex(-1);
    onResultSelect?.(result);
  }, [onResultSelect]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounced function
  useEffect(() => {
    return () => {
      searchFunction.cancel?.();
    };
  }, [searchFunction]);

  return (
    <div className="search-container" style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '16px',
            border: '2px solid #e1e5e9',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            ...(isOpen && { borderColor: '#007bff' })
          }}
        />
        
        {isLoading && (
          <div style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '14px',
            color: '#6c757d'
          }}>
            Searching...
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxHeight: '300px',
          overflowY: 'auto',
          marginTop: '4px'
        }}>
          {results.map((result, index) => (
            <div
              key={result.id || index}
              onClick={() => handleResultSelect(result)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: index === selectedIndex ? '#f8f9fa' : 'transparent',
                borderBottom: index < results.length - 1 ? '1px solid #e1e5e9' : 'none',
                transition: 'background-color 0.1s ease'
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                {result.title}
              </div>
              {result.description && (
                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                  {result.description}
                </div>
              )}
              {result.tags && result.tags.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  {result.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#e9ecef',
                        color: '#495057',
                        fontSize: '12px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginRight: '4px'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Demo usage and data
const demoData = [
  {
    id: 1,
    title: "React Best Practices",
    description: "Guide to writing clean and efficient React code",
    tags: ["react", "javascript", "frontend", "best-practices"]
  },
  {
    id: 2,
    title: "State Management with Redux",
    description: "Complete guide to managing application state",
    tags: ["redux", "state", "react", "javascript"]
  },
  {
    id: 3,
    title: "CSS Grid Layout",
    description: "Modern CSS layout techniques with Grid",
    tags: ["css", "layout", "grid", "responsive"]
  },
  {
    id: 4,
    title: "API Integration Patterns",
    description: "Common patterns for integrating REST APIs",
    tags: ["api", "rest", "integration", "backend"]
  }
];

const App = () => {
  const handleResultSelect = (result) => {
    console.log('Selected:', result);
    alert(\`Selected: \${result.title}\`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Smart Search Demo</h1>
      <p>Start typing to see intelligent search results:</p>
      
      <SmartSearchComponent
        data={demoData}
        onResultSelect={handleResultSelect}
        placeholder="Search articles, guides, and tutorials..."
      />
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <p>Try searching for: "react", "css", "api", or "best practices"</p>
      </div>
    </div>
  );
};

export default App;

/*
⚛️ React AI Features to Try:
1. Select the SmartSearchComponent → Right-click → "🤖 Explain Code"
2. Select the searchFunction → Right-click → "⚡ Optimize Code"
3. Ask AI: "How can I add accessibility features to this search component?"
4. Select handleKeyDown → Right-click → "📝 Add Comments"
5. Try typing "useState(" to see React hook completions!
6. Ask: "Convert this to use TypeScript"
*/`,

  // Advanced algorithm example
  algorithmExample: `// Enhanced AI IDE - Algorithm Demo
// Complex algorithms benefit greatly from AI assistance!

class AdvancedDataProcessor {
  constructor() {
    this.cache = new Map();
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      operationsCount: 0
    };
  }

  /**
   * Fibonacci with memoization - Classic dynamic programming example
   */
  fibonacci(n) {
    if (this.cache.has(\`fib_\${n}\`)) {
      this.stats.cacheHits++;
      return this.cache.get(\`fib_\${n}\`);
    }

    this.stats.cacheMisses++;
    this.stats.operationsCount++;

    let result;
    if (n <= 1) {
      result = n;
    } else {
      result = this.fibonacci(n - 1) + this.fibonacci(n - 2);
    }

    this.cache.set(\`fib_\${n}\`, result);
    return result;
  }

  /**
   * Binary search implementation with detailed logging
   */
  binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    let steps = 0;

    console.log(\`Searching for \${target} in array of length \${arr.length}\`);

    while (left <= right) {
      steps++;
      const mid = Math.floor((left + right) / 2);
      const midValue = arr[mid];

      console.log(\`Step \${steps}: Checking index \${mid} (value: \${midValue})\`);

      if (midValue === target) {
        console.log(\`Found \${target} at index \${mid} in \${steps} steps\`);
        return { index: mid, steps };
      } else if (midValue < target) {
        left = mid + 1;
        console.log(\`Target is larger, searching right half\`);
      } else {
        right = mid - 1;
        console.log(\`Target is smaller, searching left half\`);
      }
    }

    console.log(\`Target \${target} not found after \${steps} steps\`);
    return { index: -1, steps };
  }

  /**
   * Quick sort implementation with visualization
   */
  quickSort(arr, low = 0, high = arr.length - 1, depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(\`\${indent}QuickSort: sorting indices \${low} to \${high}\`);
    console.log(\`\${indent}Current array: [\${arr.slice(low, high + 1).join(', ')}]\`);

    if (low < high) {
      const pivotIndex = this.partition(arr, low, high, depth);
      console.log(\`\${indent}Pivot placed at index \${pivotIndex}\`);

      // Recursively sort elements before and after partition
      this.quickSort(arr, low, pivotIndex - 1, depth + 1);
      this.quickSort(arr, pivotIndex + 1, high, depth + 1);
    }

    return arr;
  }

  /**
   * Partition helper for quicksort
   */
  partition(arr, low, high, depth) {
    const indent = '  '.repeat(depth + 1);
    const pivot = arr[high];
    console.log(\`\${indent}Using pivot: \${pivot}\`);

    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        console.log(\`\${indent}Swapped \${arr[j]} and \${arr[i]}\`);
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    console.log(\`\${indent}Final pivot position: \${i + 1}\`);

    return i + 1;
  }

  /**
   * Find longest common subsequence using dynamic programming
   */
  longestCommonSubsequence(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    
    // Create DP table
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    console.log(\`Finding LCS between "\${str1}" and "\${str2}"\`);
    
    // Fill DP table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    // Reconstruct the LCS
    let lcs = '';
    let i = m, j = n;
    
    while (i > 0 && j > 0) {
      if (str1[i - 1] === str2[j - 1]) {
        lcs = str1[i - 1] + lcs;
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    
    console.log(\`Longest Common Subsequence: "\${lcs}" (length: \${dp[m][n]})\`);
    return { sequence: lcs, length: dp[m][n], table: dp };
  }

  /**
   * Graph traversal using DFS with cycle detection
   */
  depthFirstSearch(graph, startNode, visited = new Set(), path = []) {
    console.log(\`Visiting node: \${startNode}\`);
    visited.add(startNode);
    path.push(startNode);

    if (graph[startNode]) {
      for (const neighbor of graph[startNode]) {
        if (path.includes(neighbor)) {
          console.log(\`Cycle detected! Path: \${path.join(' -> ')} -> \${neighbor}\`);
          return { hasCycle: true, cycle: [...path, neighbor] };
        }
        
        if (!visited.has(neighbor)) {
          const result = this.depthFirstSearch(graph, neighbor, visited, [...path]);
          if (result.hasCycle) return result;
        }
      }
    }

    return { hasCycle: false, visitedNodes: Array.from(visited) };
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const totalCacheOperations = this.stats.cacheHits + this.stats.cacheMisses;
    const hitRate = totalCacheOperations > 0 ? 
      (this.stats.cacheHits / totalCacheOperations * 100).toFixed(2) : 0;

    return {
      ...this.stats,
      hitRate: \`\${hitRate}%\`,
      cacheSize: this.cache.size
    };
  }

  /**
   * Clear cache and reset statistics
   */
  reset() {
    this.cache.clear();
    this.stats = { cacheHits: 0, cacheMisses: 0, operationsCount: 0 };
    console.log('Cache and statistics reset');
  }
}

// Demo function to test all algorithms
function runAlgorithmDemo() {
  console.log('=== Advanced Algorithm Demo ===\\n');
  
  const processor = new AdvancedDataProcessor();
  
  // Test Fibonacci
  console.log('1. Fibonacci Sequence:');
  for (let i = 0; i <= 10; i++) {
    console.log(\`F(\${i}) = \${processor.fibonacci(i)}\`);
  }
  console.log('Stats after Fibonacci:', processor.getStats());
  console.log();
  
  // Test Binary Search
  console.log('2. Binary Search:');
  const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  console.log(\`Array: [\${sortedArray.join(', ')}]\`);
  processor.binarySearch(sortedArray, 7);
  processor.binarySearch(sortedArray, 12);
  console.log();
  
  // Test Quick Sort
  console.log('3. Quick Sort:');
  const unsorted = [64, 34, 25, 12, 22, 11, 90];
  console.log(\`Original: [\${unsorted.join(', ')}]\`);
  const sorted = processor.quickSort([...unsorted]);
  console.log(\`Sorted: [\${sorted.join(', ')}]\`);
  console.log();
  
  // Test LCS
  console.log('4. Longest Common Subsequence:');
  processor.longestCommonSubsequence('ABCDGH', 'AEDFHR');
  processor.longestCommonSubsequence('programming', 'algorithm');
  console.log();
  
  // Test DFS
  console.log('5. Depth-First Search:');
  const graph = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [],
    'E': ['F'],
    'F': []
  };
  console.log('Graph structure:', graph);
  const dfsResult = processor.depthFirstSearch(graph, 'A');
  console.log('DFS Result:', dfsResult);
  
  console.log('\\n=== Final Statistics ===');
  console.log(processor.getStats());
}

// Run the demo
runAlgorithmDemo();

/*
🧠 Algorithm AI Features to Try:
1. Select the quickSort method → Right-click → "🤖 Explain Code"
2. Select the fibonacci function → Right-click → "⚡ Optimize Code"
3. Ask AI: "How can I improve the space complexity of these algorithms?"
4. Select partition method → Right-click → "📝 Add Comments"
5. Ask: "What's the time complexity of each algorithm?"
6. Try selecting the LCS method → Right-click → "🏗️ Refactor Code"
*/`
};

// Export default demo for easy import
export default demoExamples.basicJavaScript;