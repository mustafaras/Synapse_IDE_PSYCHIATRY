import { FolderPlus, Plus, RefreshCw, Upload } from 'lucide-react';
import { IconWrapper as Icon } from '@/components/atoms/Icon';

let ThemedDropdownCmp: any = undefined;
try {

  ThemedDropdownCmp = require('@/components/atoms/ThemedDropdown').ThemedDropdown;
} catch {}
import './headerPro.css';

type HeaderProProps = {
  width?: number;
  height?: number;
  language?: string;
  onChangeLanguage?: (lang: string) => void;
  template?: string;
  onChangeTemplate?: (tpl: string) => void;
  onNewFile?: (...args: any[]) => void;
  onNewFolder?: () => void;
  onUpload?: () => void;
  onRefresh?: () => void;
  languages?: string[];
  templates?: string[];

  onFilterChange?: (value: string) => void;
  breadcrumb?: string[];
};

const defaultLangs = ['Auto', 'TypeScript', 'JavaScript', 'Python', 'C#', 'C++'];
const defaultTemplates = ['Empty', 'React Component', 'Node Script', 'HTML+CSS', 'Config'];

export const HeaderPro: React.FC<HeaderProProps> = ({
  width = 375,
  height = 100,
  language = 'Auto',
  onChangeLanguage,
  template = 'Empty',
  onChangeTemplate,
  onNewFile,
  onNewFolder,
  onUpload,
  onRefresh,
  languages = defaultLangs,
  templates = defaultTemplates,
}) => {
  const ThemedDropdown = ThemedDropdownCmp as any;

  return (
    <div
      className="fe-header-pro"
      style={{ width, height }}
      role="region"
      aria-label="File Explorer header"
    >
      <div className="row top">
        <div className="selectors">
          <div className="selector">
            <label htmlFor="fe-lang" className="label">Language</label>
            {ThemedDropdown ? (
              <ThemedDropdown
                id="fe-lang"
                value={language}
                onChange={(v: string) => onChangeLanguage?.(v)}
                options={languages.map(v => ({ label: v, value: v }))}
                aria-label="Language"
              />
            ) : (
              <select
                id="fe-lang"
                className="native"
                value={language}
                onChange={e => onChangeLanguage?.(e.target.value)}
                aria-label="Language"
              >
                {languages.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            )}
          </div>

          <div className="selector">
            <label htmlFor="fe-tpl" className="label">Template</label>
            {ThemedDropdown ? (
              <ThemedDropdown
                id="fe-tpl"
                value={template}
                onChange={(v: string) => onChangeTemplate?.(v)}
                options={templates.map(v => ({ label: v, value: v }))}
                aria-label="Template"
              />
            ) : (
              <select
                id="fe-tpl"
                className="native"
                value={template}
                onChange={e => onChangeTemplate?.(e.target.value)}
                aria-label="Template"
              >
                {templates.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="actions" role="toolbar" aria-label="File actions">
          <button className="btn" onClick={() => onNewFile?.()} aria-label="New file" title="New file">
            <Icon icon={Plus} size={18} /><span>New</span>
          </button>
          <button className="btn" onClick={onNewFolder} aria-label="New folder" title="New folder">
            <Icon icon={FolderPlus} size={18} /><span>Folder</span>
          </button>
          <button className="btn" onClick={onUpload} aria-label="Upload" title="Upload">
            <Icon icon={Upload} size={18} /><span>Upload</span>
          </button>
          <button className="btn" onClick={onRefresh} aria-label="Refresh" title="Refresh">
            <Icon icon={RefreshCw} size={18} /><span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="row bottom" aria-hidden="true">
        {}
      </div>
    </div>
  );
};

export default HeaderPro;
