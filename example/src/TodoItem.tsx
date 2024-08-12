import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import Checkbox from '@react-native-community/checkbox';
import { useFireproof } from '@fireproof/react-native';
import type { Todo, TodoFromAllDocs } from './TodoList';

type TodoItemProps = {
  readonly item: TodoFromAllDocs;
};
function TodoItem({ item }: TodoItemProps) {
  if (!item) {
    return null;
  }
  const { database: db, useDocument } = useFireproof('TodoDB');
  const [todo, setTodo, saveTodo] = useDocument<Todo>(() => item.value);
  const [editMode, setEditMode] = useState<boolean>(false);
  const textStyle = todo.completed ? styles.completed : styles.notCompleted;

  return (
    <View style={styles.itemRow}>
      <Checkbox
        value={todo.completed}
        onValueChange={async completed => {
          await saveTodo({ ...todo, completed });
          setTodo();
        }}
        style={styles.checkbox}
      />
      {editMode ? (
        <TextInput
          style={textStyle}
          value={todo.text}
          onChangeText={text => setTodo({ ...todo, text })}
          onSubmitEditing={() => {
            saveTodo();
            setEditMode(false);
          }}
        />
      ) : (
        <Text style={textStyle} onPress={() => setEditMode(true)}>
          {todo.text}
        </Text>
      )}
      <Button
        title="X"
        color="red"
        onPress={async () => {
          const del = await db.del(todo._id || '');
          console.log({ del });
        }}
      />
    </View>
  );
};

export default TodoItem;

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  completed: {
    flex: 1,
    textDecorationLine: 'line-through',
  },
  notCompleted: {
    flex: 1,
    textDecorationLine: 'none',
  },
});
