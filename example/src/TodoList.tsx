import React, { useEffect, useState } from 'react';
import {
  Button,
  // FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFireproof } from '@fireproof/react-native';
import TodoItem from './TodoItem';

export type Todo = { text: string; date: number; completed: boolean };
export type TodoFromAllDocs = { key: string; value: Todo };

const TodoList = () => {

  const defaultTodo: Todo = {
    text: '',
    date: Date.now(),
    completed: false,
  };

  // ============
  // db.allDocs()
  // ============

  const { database: db, useDocument } = useFireproof('TodoDB');
  const [todo, setTodo, saveTodo] = useDocument<Todo>(() => defaultTodo);
  const [todos, setTodos] = useState<TodoFromAllDocs[]>([])
  const getDocs = async () => {
    const { rows } = await db.allDocs<Todo>();
    setTodos(rows);
  }

  useEffect(() => {
    getDocs()
  }, []);

  const returnChangeData = false;
  db.subscribe((changes) => {
    if (changes.length > 0) {
      console.log({changes});
      // This is a bit brute-strength, to get all docs upon one change.
      // It's one subscription though, vs. one subscription per doc.
      getDocs();
    }
  }, returnChangeData);

  // // ============
  // // useLiveQuery
  // // ============

  // const { useLiveQuery } = useFireproof('TodoDB');
  // const todos: Todo[] = useLiveQuery<Todo>('date', {
  //   limit: 10,
  //   descending: true,
  // }).docs;

  console.log({ todos });

  return (
    <View style={styles.container}>
      <View>
        <TextInput
          placeholder="new todo"
          onChangeText={text => setTodo({ text } as Todo)}
          value={todo.text}
        />
        <Button
          title="Add Todo"
          onPress={() => {
            saveTodo();
            setTodo(defaultTodo);
          }}
        />
      </View>
      <View>
        <Text>Todo List:</Text>
        {todos.map(
          (todo, i) =>
            // @ts-expect-error `Property '_deleted' does not exist on type 'Doc<Todo>'.`
            !todo?.value._deleted && <TodoItem key={i} item={todo} />,
        )}

        {/* for some reason, this is throwing the React Hooks error.  Maybe useMemo() in useFireproof? */}
        {/* <FlatList<TodoFromAllDocs>
          data={todos}
          renderItem={({item, index}) => (<TodoItem key={index} item={item} />)}
        /> */}
      </View>
    </View>
  );
};

export default TodoList;

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
});
