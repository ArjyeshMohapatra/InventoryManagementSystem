import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductStore } from '../../store/product.store';
import { InventoryTransactionStore } from '../../../inventory-transactions/store/inventory-transaction.store';
import { Table } from '@shared/ui';
import { BaseChartDirective } from 'ng2-charts';
import { formatTransactionDate } from 'src/app/shared/utils/date-formatter';
import {
  ChartConfiguration,
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  LineController,
  Filler,
  Legend
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
  Tooltip,
  Legend,
  LineController
);

@Component({
  selector: 'app-product-history',
  standalone: true,
  imports: [
    Table,
    BaseChartDirective
  ],
  templateUrl: './product-history.html'
})
export class ProductHistory {

  private route = inject(ActivatedRoute);
  private productStore = inject(ProductStore);
  private transactionStore = inject(InventoryTransactionStore);

  prodStore = this.productStore;
  tranStore = this.transactionStore;

  columns = [
    'date',
    'action',
    'quantity',
    'resultingStock'
  ];

  id = String(this.route.snapshot.paramMap.get('id'));

  constructor() {
    this.prodStore.loadProductById(this.id);
    this.tranStore.loadTransactions();
  }

  transactions = computed(() => {
    return this.tranStore.getTransactionsByProduct(this.id);
  });

  historyRows = computed(() => {

    const transactions = [...this.transactions()].sort((a, b) =>
      new Date(a.date).getTime() -
      new Date(b.date).getTime()
    );
  
    const currentStock = this.prodStore.selectedProduct()?.stock ?? 0;
  
    let runningStock = currentStock;
  
    return [...transactions].reverse().map(transaction => {
        const resultStock = runningStock;
  
        runningStock = transaction.type === 'ADD'
            ? runningStock + transaction.quantity
            : runningStock - transaction.quantity;
  
      return {
        date: formatTransactionDate(transaction.date, 'long'),
          action: transaction.type,
          quantity: transaction.quantity,
          resultingStock: resultStock
        };
      })
      .reverse();
  
  });

  stockTrendData = computed(() => {
    const rows = this.historyRows();
  
    return rows.map(row => ({
      date: formatTransactionDate(row.date, 'short'),
      stock: row.resultingStock
    }));
  });

  lineChartData = computed<ChartConfiguration<'line'>['data']>(() => ({
    labels: this.stockTrendData().map(row => row.date),
    datasets: [
      {
        data: this.stockTrendData().map(
          row => row.stock
        ),
        label: 'Stock Level',
    
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.25)',
    
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointRadius: 5,
        pointHoverRadius: 7,
    
        borderWidth: 3,
        fill: true,
        tension: 0.35
      }
    ]
  }));

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
      display: true
    },
    tooltip: {
      enabled: true
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#6b7280'
      },
      grid: {
        color: '#e5e7eb'
      }
    },
    x: {
      ticks: {
        color: '#6b7280'
      },
      grid: {
        display: false
      }
    }
  }
};

}