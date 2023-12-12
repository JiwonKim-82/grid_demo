
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, ColumnApi, GridApi, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as data from './data.json';
import { UserData } from './user-data.model';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import {MatBadgeModule} from '@angular/material/badge';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
interface FilterItem {
  name: string;
  options: string[];
  selectedOption: string
}

interface OptionalCol {
  field: string;
  checked?: boolean;
  visible?: boolean;
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    AgGridModule, 
    HttpClientModule, 
    MatListModule,
    MatButtonModule,
    MatExpansionModule,
    MatRadioModule,
    MatBadgeModule,
    MatIconModule,
    MatCheckboxModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation : ViewEncapsulation.None,
})
export class AppComponent implements OnInit{

  private gridApi!: GridApi;
  private jsonData = data;
  private columnApi!: ColumnApi;

  userData!: UserData[];
  panelOpenState = false;
  isSelectAllChecked: boolean = false;
  rowData$!: Observable<any[]>;

  @ViewChild('panel', { read: ElementRef }) public panel: ElementRef<any>;
  
  colDefs: ColDef[] = [];
  optionalCols: OptionalCol[] = [
    {
      field: 'face_amount',
      checked: false,
      visible: false,
    },
    {
      field: 'gross_premium_amt_itd',
      checked: false,
      visible: false,
    },
    {
      field: 'net_death_benefit_amt',
      checked: false,
      visible: false,
    },
    {
      field: 'policy_count',
      checked: false,
      visible: false,
    },
  ];
  
  defaultColDef: ColDef = {
    sortable: true, 
    resizable: true, 
    flex: 1, 
    minWidth: 150, 
    maxWidth: 200,
  }

  selection = new BehaviorSubject<string>('');
  selectionNum = new BehaviorSubject<number>(0);

  isExpanded = false;
  
  items: FilterItem[] = [
    {
      name: 'Filter 1',
      options: ['Option A', 'Option B', 'Option C'],
      selectedOption: ''
    },
    {
      name: 'Filter 2',
      options: ['Option D', 'Option E', 'Option F'],
      selectedOption: ''
    }
  ];

  constructor(private http: HttpClient){}

  ngOnInit(): void {
    const gridData = this.jsonData.hits[0];
    this.userData = gridData.document.map((user: any) => {
      return this.createUserFromJSON(user);
    });
    this.rowData$ = new Observable((observer) => {
      observer.next(this.userData);
    });

    type UserDataProperty = keyof UserData;
    this.colDefs = [
      {
        headerName: 'Full Name',
        field: 'fullName',
        valueGetter: ({ data }) => `${data.fullName}`, // Use the getter method
        checkboxSelection: true,
        filter: 'agTextColumnFilter',
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        pinned: 'left',
        initialHide: false,
      },
      ...Object.keys(new UserData())
        .filter((property: string) => property !== 'first_name' && property !== 'last_name')
        .map((property: string, index: number, array: string[]) => {
          const headerName = this.toTitleCase(property);
          const dataType = this.userData[0].getPropertyType(property as UserDataProperty);
          const filter = dataType === 'number' ? 'agNumberColumnFilter' : 'agTextColumnFilter';
          return {
            headerName: headerName,
            field: property,
            filter: filter,
            initialHide: index >= array.length - 4,
          };
        }),
    ];
  }

  private createUserFromJSON(user: any): UserData {
    return new UserData(
      user.contact_level,
      user.location,
      user.phone_number,
      user.email_address,
      user.distributor,
      user.annual_premium,
      user.client_count,
      user.face_amount,
      user.first_name,
      user.gross_premium_amt_itd,
      user.last_name,
      user.net_death_benefit_amt,
      user.policy_count
    );
  }
  

  toTitleCase(str: string): string {
    return str.replace(/_/g, ' ').replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  toggleSelectAll(event: MatCheckboxChange): void {
    if (event.checked) {
      this.optionalCols.forEach((col) => (col.checked = true));
    } else {
      this.optionalCols.forEach((col) => (col.checked = false));
    }
    this.optionalCols.forEach((col) => this.toggleColumnVisibility(col));
    this.isSelectAllChecked = this.optionalCols.every((col) => col.checked);
  }

  toggleColumnVisibility(optionalCol: OptionalCol): void {
    const field = optionalCol.field;
    if (field) {
      this.columnApi.setColumnVisible(field, optionalCol.checked);
      optionalCol.visible = optionalCol.checked;
    }
    this.isSelectAllChecked = this.optionalCols.every((col) => col.checked);
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi; 
  }

  onSelectionChanged(e: any){
    const selected = this.gridApi.getSelectedRows().map(row => row.fullName).join(', ');
    const selectedNum = this.gridApi.getSelectedRows().length;
    this.selection.next(selected);
    this.selectionNum.next(selectedNum);
  }

  clearOption(item){
    item.selectedOption = '';
  }

  clearAllOptions(): void {
    for (let item of this.items) {
      item.selectedOption = '';
      setTimeout(() => {
        this.isExpanded = !this.isExpanded;
      });
    }

  }

}