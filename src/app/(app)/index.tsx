import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PriorityBadge, PriorityPicker } from '@/components/priority-badge';
import { useToast } from '@/components/toast';
import { UpgradeGate } from '@/components/upgrade-gate';
import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';
import { useSharedProfile } from '@/contexts/profile-context';
import { useTheme } from '@/hooks/use-theme';
import { FREE_TODO_LIMIT, type Priority, type Todo, useTodos } from '@/hooks/use-todos';

// ---------------------------------------------------------------------------
// Upgrade banner — shown inline at the bottom when Free cap is reached
// ---------------------------------------------------------------------------
function UpgradeBanner({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={banner.wrap}
      accessibilityRole="button"
      accessibilityLabel="Upgrade to Pro for unlimited todos">
      <View style={banner.left}>
        <Text style={banner.emoji}>🔒</Text>
        <View style={banner.textCol}>
          <Text style={banner.title}>You've reached the Free limit</Text>
          <Text style={banner.sub}>Upgrade to Pro for unlimited todos &amp; more.</Text>
        </View>
      </View>
      <View style={banner.btn}>
        <Text style={banner.btnText}>Upgrade →</Text>
      </View>
    </Pressable>
  );
}

const banner = StyleSheet.create({
  wrap: {
    marginHorizontal: 0,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.lavenderTonic,
    backgroundColor: 'rgba(200,190,250,0.07)',
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  left:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  textCol: { flex: 1, gap: 2 },
  emoji:   { fontSize: 22 },
  title:   { fontFamily: Fonts.semibold, fontSize: 13, color: Brand.lavenderTonic },
  sub:     { fontFamily: Fonts.regular,  fontSize: 12, color: 'rgba(200,190,250,0.6)', lineHeight: 16 },
  btn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Brand.lavenderTonic,
  },
  btnText: { fontFamily: Fonts.bold, fontSize: 12, color: Brand.championBlue },
});

// ---------------------------------------------------------------------------
// Greeting
// ---------------------------------------------------------------------------
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ---------------------------------------------------------------------------
// Filter tab
// ---------------------------------------------------------------------------
type Filter = 'all' | 'active' | 'completed';

function FilterTab({ label, value, active, count, onPress }: {
  label: string; value: Filter; active: boolean; count: number; onPress: (v: Filter) => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => onPress(value)}
      style={[styles.filterTab, { borderColor: theme.border }, active && { backgroundColor: theme.accent, borderColor: theme.accent }]}
      accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <Text style={[styles.filterTabText, { color: active ? theme.accentText : theme.textSecondary }, active && { fontFamily: Fonts.semibold }]}>
        {label}{count > 0 ? ` (${count})` : ''}
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Edit modal
// ---------------------------------------------------------------------------
function EditModal({ todo, isPro, onSave, onClose }: {
  todo: Todo; isPro: boolean;
  onSave: (text: string, priority: Priority) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const [text, setText]         = useState(todo.text);
  const [priority, setPriority] = useState<Priority>(todo.priority);

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={editStyles.backdrop} onPress={onClose}>
        <Pressable style={editStyles.sheet} onPress={() => {}}>
          <Text style={editStyles.title}>Edit task</Text>

          <TextInput
            style={[editStyles.input, { color: theme.text }]}
            value={text}
            onChangeText={setText}
            autoFocus
            multiline
            accessibilityLabel="Task text"
          />

          <Text style={editStyles.label}>Priority</Text>
          <PriorityPicker value={priority} onChange={setPriority} isPro={isPro} />

          <View style={editStyles.btnRow}>
            <Pressable style={editStyles.cancelBtn} onPress={onClose}>
              <Text style={editStyles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[editStyles.saveBtn, !text.trim() && { opacity: 0.4 }]}
              onPress={() => text.trim() && onSave(text.trim(), priority)}
              disabled={!text.trim()}>
              <Text style={editStyles.saveText}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const editStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet:    { backgroundColor: '#1e1a3a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.four, paddingBottom: Spacing.five, gap: Spacing.three, borderWidth: 1, borderColor: '#2d2856' },
  title:    { fontFamily: Fonts.bold, fontSize: 18, color: Brand.lavenderTonic },
  label:    { fontFamily: Fonts.semibold, fontSize: 13, color: Brand.lavenderTonic },
  input:    { fontFamily: Fonts.regular, fontSize: 15, backgroundColor: '#151130', borderRadius: Radius.sm, borderWidth: 1, borderColor: '#2d2856', padding: Spacing.three, minHeight: 56, lineHeight: 22 },
  btnRow:   { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  cancelBtn:{ flex: 1, height: 48, borderRadius: Radius.md, borderWidth: 1, borderColor: '#2d2856', alignItems: 'center', justifyContent: 'center' },
  cancelText:{ fontFamily: Fonts.medium, fontSize: 15, color: 'rgba(200,190,250,0.6)' },
  saveBtn:  { flex: 2, height: 48, borderRadius: Radius.md, backgroundColor: Brand.lavenderTonic, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontFamily: Fonts.bold, fontSize: 15, color: Brand.championBlue },
});

// ---------------------------------------------------------------------------
// Todo row
// ---------------------------------------------------------------------------
function TodoItem({ todo, isPro, onToggle, onDelete, onEdit, onPriorityChange }: {
  todo: Todo; isPro: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onPriorityChange: (id: string, p: Priority, current: Priority) => void;
}) {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={[styles.todoRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      {/* Checkbox */}
      <Pressable
        onPress={() => onToggle(todo.id, todo.completed)}
        style={[styles.checkbox, { borderColor: theme.accent }, todo.completed && { backgroundColor: theme.accent, borderColor: theme.accent }]}
        accessibilityRole="checkbox" accessibilityState={{ checked: todo.completed }}
        accessibilityLabel={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}>
        {todo.completed && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>

      {/* Content */}
      <View style={styles.todoContent}>
        <Text style={[styles.todoText, { color: theme.text }, todo.completed && { textDecorationLine: 'line-through', color: theme.textSecondary }]}>
          {todo.text}
        </Text>

        {/* Priority badge — tap to toggle picker */}
        <Pressable onPress={() => setShowPicker(p => !p)} accessibilityRole="button" accessibilityLabel="Change priority">
          <PriorityBadge priority={todo.priority} />
        </Pressable>

        {/* Inline priority picker (expands on badge tap) */}
        {showPicker && (
          <PriorityPicker
            value={todo.priority}
            isPro={isPro}
            onChange={p => {
              onPriorityChange(todo.id, p, todo.priority);
              setShowPicker(false);
            }}
          />
        )}
      </View>

      {/* Actions */}
      <View style={styles.todoActions}>
        <Pressable onPress={() => onEdit(todo)} style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Edit task">
          <Text style={[styles.actionIcon, { color: theme.textSecondary }]}>✎</Text>
        </Pressable>
        <Pressable onPress={() => onDelete(todo.id)} style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Delete task">
          <Text style={[styles.actionIcon, { color: theme.textSecondary }]}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function TodoScreen() {
  const theme           = useTheme();
  const { showToast }   = useToast();
  const { profile }     = useSharedProfile();
  const router          = useRouter();

  const isPro  = profile?.plan === 'pro';
  const userId = profile?.id;

  const {
    todos, loading, canAdd,
    active, completed, remaining,
    addTodo, toggleTodo, updatePriority, editTodo, deleteTodo,
  } = useTodos(userId, profile?.plan ?? 'free');

  const [input,        setInput]        = useState('');
  const [newPriority,  setNewPriority]  = useState<Priority>('medium');
  const [showNewPicker,setShowNewPicker]= useState(false);
  const [filter,       setFilter]       = useState<Filter>('all');
  const [editingTodo,  setEditingTodo]  = useState<Todo | null>(null);
  const [gateReason,   setGateReason]   = useState<'cap' | 'priority' | null>(null);

  const filtered =
    filter === 'active'    ? active    :
    filter === 'completed' ? completed :
    todos;

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  // ── handlers ──────────────────────────────────────────────────────────
  async function handleAdd() {
    const text = input.trim();
    if (!text) return;
    const { error } = await addTodo(text, newPriority);
    if (error === 'cap')     { setGateReason('cap'); return; }
    if (error)               { showToast(error, 'error'); return; }
    setInput('');
    setNewPriority('medium');
    setShowNewPicker(false);
  }

  async function handleToggle(id: string, current: boolean) {
    const { error } = await toggleTodo(id, current);
    if (error) showToast(error, 'error');
  }

  async function handleDelete(id: string) {
    const { error } = await deleteTodo(id);
    if (error) showToast(error, 'error');
    else showToast('Task deleted.', 'info');
  }

  async function handlePriorityChange(id: string, p: Priority, current: Priority) {
    const { error } = await updatePriority(id, p, current);
    if (error === 'pro_feature') { setGateReason('priority'); return; }
    if (error) showToast(error, 'error');
  }

  async function handleEditSave(text: string, priority: Priority) {
    if (!editingTodo) return;
    const textChanged     = text !== editingTodo.text;
    const priorityChanged = priority !== editingTodo.priority;

    if (textChanged) {
      const { error } = await editTodo(editingTodo.id, text, editingTodo.text);
      if (error) { showToast(error, 'error'); return; }
    }
    if (priorityChanged) {
      const { error } = await updatePriority(editingTodo.id, priority, editingTodo.priority);
      if (error === 'pro_feature') { setGateReason('priority'); return; }
      if (error) { showToast(error, 'error'); return; }
    }
    setEditingTodo(null);
    showToast('Task updated.', 'success');
  }

  // Free cap progress bar
  const capProgress = isPro ? 1 : Math.min(todos.length / FREE_TODO_LIMIT, 1);
  const capColor    = todos.length >= FREE_TODO_LIMIT ? '#f07070' : Brand.lavenderTonic;

  function goToUpgrade() {
    setGateReason(null);
    router.push('/(app)/profile');
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting()},</Text>
          <Text style={[styles.title,    { color: theme.text }]}>{firstName} 👋</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {remaining === 0 ? 'All caught up!' : `${remaining} task${remaining !== 1 ? 's' : ''} remaining`}
          </Text>

          {/* Free cap bar */}
          {!isPro && (
            <View style={styles.capRow}>
              <View style={[styles.capBarBg, { backgroundColor: theme.border }]}>
                <View style={[styles.capBarFill, { width: `${capProgress * 100}%`, backgroundColor: capColor }]} />
              </View>
              <Text style={[styles.capLabel, { color: theme.textSecondary }]}>
                {todos.length}/{FREE_TODO_LIMIT} free todos
              </Text>
            </View>
          )}
        </View>

        {/* Input row */}
        <View style={[
          styles.inputRow,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          !canAdd && !isPro && { opacity: 0.45 },
        ]}>
          <View style={styles.inputInner}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={!canAdd && !isPro ? 'Upgrade to add more tasks…' : 'Add a new task…'}
              placeholderTextColor={theme.textSecondary}
              value={input} onChangeText={setInput}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
              editable={isPro || canAdd}
              accessibilityLabel="New task input"
            />
            {/* Priority toggle for new task */}
            <Pressable onPress={() => setShowNewPicker(p => !p)} style={styles.priorityToggle}>
              <PriorityBadge priority={newPriority} />
            </Pressable>
          </View>
          <Pressable
            onPress={handleAdd}
            style={[styles.addBtn, !input.trim() && styles.addBtnDisabled]}
            disabled={!input.trim()} accessibilityRole="button" accessibilityLabel="Add task">
            <Text style={[styles.addBtnText, { color: Brand.championBlue }]}>＋</Text>
          </Pressable>
        </View>

        {/* New task priority picker */}
        {showNewPicker && (
          <View style={[styles.newPickerWrap, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <PriorityPicker
              value={newPriority}
              isPro={isPro}
              onChange={p => {
                if (!isPro && p !== 'medium') { setGateReason('priority'); return; }
                setNewPriority(p);
                setShowNewPicker(false);
              }}
            />
          </View>
        )}

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          <FilterTab value="all"       label="All"    active={filter === 'all'}       count={todos.length}     onPress={setFilter} />
          <FilterTab value="active"    label="Active" active={filter === 'active'}    count={active.length}    onPress={setFilter} />
          <FilterTab value="completed" label="Done"   active={filter === 'completed'} count={completed.length} onPress={setFilter} />
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.empty}>
            <ActivityIndicator color={Brand.lavenderTonic} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
            renderItem={({ item }) => (
              <TodoItem
                todo={item} isPro={isPro}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={setEditingTodo}
                onPriorityChange={handlePriorityChange}
              />
            )}
            ListFooterComponent={
              // Show upgrade banner after the list when cap is hit
              !isPro && !canAdd ? (
                <UpgradeBanner onPress={goToUpgrade} />
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {filter === 'completed' ? 'Nothing completed yet.' :
                   filter === 'active'    ? 'All done! 🎉' :
                                           'No tasks yet. Add one above.'}
                </Text>
              </View>
            }
          />
        )}

      </SafeAreaView>

      {/* Edit modal */}
      {editingTodo && (
        <EditModal
          todo={editingTodo} isPro={isPro}
          onSave={handleEditSave}
          onClose={() => setEditingTodo(null)}
        />
      )}

      {/* Upgrade gate */}
      <UpgradeGate
        visible={!!gateReason}
        reason={gateReason}
        onUpgrade={goToUpgrade}
        onDismiss={() => setGateReason(null)}
      />

    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  screen:   { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.four },

  header:   { marginBottom: Spacing.three, gap: 2 },
  greeting: { fontFamily: Fonts.regular, fontSize: 14 },
  title:    { fontFamily: Fonts.bold,    fontSize: 30, letterSpacing: -0.3 },
  subtitle: { fontFamily: Fonts.medium,  fontSize: 13, marginTop: 2 },

  capRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: 6 },
  capBarBg:   { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  capBarFill: { height: '100%', borderRadius: 2 },
  capLabel:   { fontFamily: Fonts.regular, fontSize: 11 },

  inputRow:    { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, marginBottom: Spacing.one, gap: Spacing.two },
  inputInner:  { flex: 1, gap: 4 },
  input:       { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, paddingVertical: Spacing.one },
  priorityToggle: { alignSelf: 'flex-start' },
  addBtn:      { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Brand.lavenderTonic, alignItems: 'center', justifyContent: 'center' },
  addBtnDisabled: { opacity: 0.35 },
  addBtnText:  { fontFamily: Fonts.bold, fontSize: 20, lineHeight: 22 },

  newPickerWrap: { borderRadius: Radius.md, borderWidth: 1, padding: Spacing.two, marginBottom: Spacing.two },

  filterRow:     { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.three, marginTop: Spacing.two },
  filterTab:     { flex: 1, paddingVertical: Spacing.two, borderRadius: Radius.sm, borderWidth: 1, alignItems: 'center' },
  filterTabText: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 18 },

  list:       { paddingBottom: Spacing.six },
  todoRow:    { borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  checkbox:   { width: 24, height: 24, borderRadius: Radius.full, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  checkmark:  { fontFamily: Fonts.bold, color: Brand.championBlue, fontSize: 13, lineHeight: 14 },
  todoContent:{ flex: 1, gap: 4 },
  todoText:   { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22 },
  todoActions:{ flexDirection: 'column', gap: 4, flexShrink: 0 },
  actionBtn:  { padding: 4 },
  actionIcon: { fontSize: 14 },

  empty:     { paddingTop: Spacing.six, alignItems: 'center' },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14 },
});
