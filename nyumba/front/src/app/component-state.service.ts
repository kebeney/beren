/**
 * Created by kip on 3/28/17.
 */
import {Injectable } from '@angular/core';

@Injectable()
export class ComponentStateService{
  public componentName = ""
  public activeAddButtonText = "";
  public editing = false;
  public component: any
  public componentArray: any[] = []
  public addText = "Add";
  public serverMessage = "";

  update(done: boolean, defaultComponent: any): void {
    if(!this.editing){
      this.editing = true;
      this.activeAddButtonText = this.addText;
    }else if(done){
      this.componentArray.push(this.component);
      this.component = defaultComponent;
      this.editing = false;
      this.activeAddButtonText = this.addText+" "+this.componentName;
    }
    else{
      this.componentArray.push(this.component);
      this.component = defaultComponent;
    }
  }
  get_components_as_string(): string {
    var result = this.componentArray.map(function (e) {
      return JSON.stringify(e,null," ");
    });
    return "["+result.join(",")+"]";
  }
}
