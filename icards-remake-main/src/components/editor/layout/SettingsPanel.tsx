import { useSettingStore } from '@/lib/store/useSettingStore';
import SidebarListEditor from '../settings/shared/SidebarListEditor';
import LoveStoryForm from '../settings/forms/LoveStoryForm';

// Bên trong component:
const { settings, updateSetting } = useSettingStore();

<SidebarListEditor
    title="Cột mốc"
    items={settings.loveStory || []}
    onUpdate={(newItems) => updateSetting('loveStory', newItems)}
    FormComponent={LoveStoryForm}
    defaultNewItem={{ title: '', date: '', description: '', imageUrl: null }}
    renderListItem={(item) => (
        <div className="flex flex-col">
            <span className="text-sm font-semibold text-ink truncate">{item.title || '(Chưa có tiêu đề)'}</span>
            <span className="text-xs text-muted truncate">{item.date || '(Chưa có ngày)'}</span>
        </div>
    )}
/>