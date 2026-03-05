import { ref, onValue, set, remove } from 'firebase/database';
import { rotationDb } from './rotation-firebase';
import type { RotationStudent } from '@/types/rotation';

export function onStudentsChange(callback: (students: RotationStudent[]) => void): () => void {
  const studentsRef = ref(rotationDb, 'students');
  const unsubscribe = onValue(
    studentsRef,
    (snapshot) => {
      const data = snapshot.val();
      const list: RotationStudent[] = data ? Object.values(data) : [];
      callback(list);
    },
    (error) => {
      console.error('Rotation Firebase read error:', error);
      callback([]);
    }
  );
  return unsubscribe;
}

export async function saveStudent(student: RotationStudent): Promise<void> {
  const studentRef = ref(rotationDb, `students/${student.id}`);
  await set(studentRef, student);
}

export async function deleteStudent(id: string): Promise<void> {
  const studentRef = ref(rotationDb, `students/${id}`);
  await remove(studentRef);
}

export async function clearAllStudents(): Promise<void> {
  const studentsRef = ref(rotationDb, 'students');
  await remove(studentsRef);
}
