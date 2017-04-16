/**
 * Created by kip on 3/28/17.
 */
import {Injectable } from '@angular/core';
import {ErenHttpService} from "./eren-http.service";

@Injectable()
export class ComponentStateService<T>{
  public componentName = ""
  public activeAddButtonText = "";
  public editing = false;
  public component: T
  public componentArray: T[] = []; public newComponentArray: T[] = [];
  public addText = "Add";
  public serverMessage = "";

  update(done: boolean, defaultComponent: T): void {
    if(!this.editing){
      this.editing = true;
      this.activeAddButtonText = this.addText;
      this.component = defaultComponent;
    }else if(done){
      this.componentArray.push(this.component); this.newComponentArray.push(this.component);
      this.editing = false;
      this.activeAddButtonText = this.addText+" "+this.componentName;
      this.component = defaultComponent;
    }
    else{
      this.componentArray.push(this.component); this.newComponentArray.push(this.component);
      this.component = defaultComponent;
    }
  }
  get_components_as_string(): string {
    var result = this.newComponentArray.map(function (e) {
      return JSON.stringify(e,null," ");
    });
    return "["+result.join(",")+"]";
  }

  savePost(service: any, endPoint: string){
    this.serverMessage = "Loading Content..."
    service.update(this.get_components_as_string(),endPoint).then(compList => this.processOkResponse(compList) ).catch(res => { this.showFailure(); });
  }
  getExistingRecords(service: ErenHttpService<T>, endPoint: string): void {
    this.serverMessage = "Loading Content..."
    service.getRecords(endPoint).then(compList => this.processOkResponse(compList) ).catch(res => this.showFailure() );
  }
  processOkResponse(compList: T[]): void {
    if( compList instanceof Array) {
      this.componentArray = compList; this.serverMessage = ""; this.newComponentArray = [] }
    else {  this.showFailure(); }
  }
  showFailure(): void {
    this.serverMessage = "Unsuccessful. Try later"
  }
}
