import { ChangeDetectionStrategy, Component, computed, ElementRef, signal, ViewChild } from '@angular/core';

@Component({
  selector: 'sc-svg',
  imports: [],
  templateUrl: './svg.component.html',
  styleUrl: './svg.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgComponent {

  readonly downloadUrl = signal('');
  readonly hasDownload = computed(() => this.downloadUrl().length > 0);

  @ViewChild('input')
  input: ElementRef<HTMLInputElement> | undefined;

  onUpload() {
    if (this.input != undefined) {
      this.input.nativeElement.click();
    }
  }

  onInputChange() {
    if (this.input != undefined && (this.input.nativeElement.files?.length ?? 0) === 1) {
      const item = this.input.nativeElement.files!.item(0);
      if (item != null) {
        item.text().then(it => this.loadSvg(it));
      }
    }
  }

  private loadSvg(svg: string) {
    const json = {name: 'Me', age: 20};
    this.setDownload(json);
  }

  private setDownload(json: any) {
    this.downloadUrl.set(`data:application/json;base64,${btoa(JSON.stringify(json))}`);
  }
}
