from typing import List, Dict, Optional

def display_menu():
    print("\n--- 📝 EVOLUTION OF TODO: PHASE 1 ---")
    print("1. Add Task")
    print("2. View All Tasks")
    print("3. Update Task")
    print("4. Mark Task Complete")
    print("5. Delete Task")
    print("6. Exit")

def main():
    tasks: List[Dict] = []
    
    while True:
        display_menu()
        choice = input("\nSelect an option (1-6): ")

        if choice == "1":
            title = input("Enter Title: ")
            desc = input("Enter Description: ")
            tasks.append({
                "id": len(tasks) + 1, 
                "title": title, 
                "desc": desc, 
                "status": "Pending"
            })
            print("✅ Task Added Successfully!")

        elif choice == "2":
            if not tasks:
                print("\n📭 No tasks found.")
            else:
                print("\n--- YOUR TASKS ---")
                for t in tasks:
                    status_icon = "✅" if t['status'] == "Completed" else "⏳"
                    print(f"{t['id']}. {status_icon} {t['title']} - {t['desc']}")

        elif choice == "3":
            tid = int(input("Enter Task ID to update: "))
            for t in tasks:
                if t['id'] == tid:
                    t['title'] = input(f"New Title ({t['title']}): ") or t['title']
                    t['desc'] = input(f"New Description ({t['desc']}): ") or t['desc']
                    print("🔄 Task Updated!")
                    break
            else:
                print("❌ Task not found.")

        elif choice == "4":
            tid = int(input("Enter Task ID to mark complete: "))
            for t in tasks:
                if t['id'] == tid:
                    t['status'] = "Completed"
                    print("✅ Task marked as Done!")
                    break

        elif choice == "5":
            tid = int(input("Enter Task ID to delete: "))
            tasks[:] = [t for t in tasks if t['id'] != tid]
            print("🗑️ Task Deleted!")

        elif choice == "6":
            print("👋 Goodbye!")
            break

if __name__ == "__main__":
    main()