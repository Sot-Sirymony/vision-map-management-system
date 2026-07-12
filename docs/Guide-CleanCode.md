Here is a comprehensive list of Clean Code principles and best practices, categorized by their core domains, based on the *Clean Code* handbook and software design best practices:

**Meaningful Names**
*   **Use Intention-Revealing Names:** Names should answer why a variable or class exists, what it does, and how it is used without needing a comment.
*   **Be Pronounceable and Searchable:** Avoid single-letter variables (except as short loop counters) and avoid encodings or Hungarian notation.
*   **Avoid Mental Mapping:** Readers shouldn't have to mentally translate your names into concepts they understand. 
*   **Classes vs. Methods:** Classes and objects should have noun or noun-phrase names (e.g., `Customer`, `Account`). Methods should have verb or verb-phrase names (e.g., `postPayment`, `deletePage`).
*   **Pick One Word per Concept:** Keep your lexicon consistent (e.g., don't mix `fetch`, `retrieve`, and `get` across different classes).

**Functions**
*   **Keep Them Small:** The first rule of functions is that they should be small; the second rule is that they should be *even smaller*.
*   **Do One Thing:** Functions should do one thing, do it well, and do it only. 
*   **One Level of Abstraction:** Statements within a function should all be at the same level of abstraction, reading like a top-down narrative (The Step-down Rule).
*   **Minimize Arguments:** The ideal number of arguments is zero. One or two are acceptable, but three or more should be avoided or refactored into objects. Avoid passing boolean "flag" arguments, as they indicate the function does more than one thing.
*   **Have No Side Effects:** Functions should either do something or answer something, but not both (Command Query Separation).
*   **Don't Repeat Yourself (DRY):** Eliminate duplicated algorithms and duplicated code.

**Comments**
*   **Comments Do Not Make Up for Bad Code:** Don't write a comment to explain a mess; clean the code instead.
*   **Explain Yourself in Code:** Whenever possible, create a function or variable that says the exact same thing your comment was going to say.
*   **Delete Commented-Out Code:** Do not leave old code commented out. Source control systems will remember it if you ever need it again.
*   **Avoid Noise:** Do not add redundant comments, misleading comments, or required but useless Javadocs that restate the obvious. 

**Formatting**
*   **The Newspaper Metaphor:** Code should read vertically like a newspaper. High-level concepts and algorithms at the top, increasing in detail as you read downward.
*   **Vertical Openness and Density:** Separate different concepts with blank lines, and group closely related lines tightly together.
*   **Indentation:** Adhere to strict indentation rules based on the hierarchy of scopes to make code structure visually understandable.
*   **Team Rules:** A team must agree upon a single formatting style, and every member should comply to maintain consistent software.

**Objects and Data Structures**
*   **Data Abstraction:** Objects should hide their internal implementation and only expose abstract interfaces to manipulate the essence of their data.
*   **The Law of Demeter:** A module should not know about the inner workings of the objects it manipulates. Avoid "train wrecks" (e.g., `ctxt.getOptions().getScratchDir().getAbsolutePath()`).

**Error Handling**
*   **Use Exceptions Instead of Return Codes:** Throwing exceptions separates error processing from the main "happy path" logic, keeping the code cleaner.
*   **Write Try-Catch-Finally First:** This helps define the scope of your code and what the user should expect regardless of what goes wrong.
*   **Don't Return Null:** Returning `null` forces the caller to write endless `null` checks and invites `NullPointerException`s. Return an empty list or a Special Case Object instead.
*   **Don't Pass Null:** Passing `null` into methods is even worse and should be strictly avoided.

**Boundaries**
*   **Use Learning Tests:** Write unit tests to explore and verify your understanding of third-party libraries.
*   **Wrap Third-Party APIs:** Encapsulate boundary interfaces so your code doesn't depend heavily on third-party design choices, making migrations and mocking easier.

**Unit Tests**
*   **Three Laws of TDD:** Write a failing test before writing production code, write only enough test code to fail, and write only enough production code to pass the test.
*   **Keep Tests Clean:** Test code is a first-class citizen. If tests are messy, they become a liability as production code changes.
*   **One Concept Per Test:** Minimize the number of asserts per test and ensure each test evaluates only one specific concept.
*   **F.I.R.S.T. Principles:** Tests should be **F**ast, **I**ndependent, **R**epeatable, **S**elf-Validating, and **T**imely.

**Classes**
*   **Keep Them Small:** Class size is measured by responsibilities. A class should be small.
*   **Single Responsibility Principle (SRP):** A class should have one, and only one, reason to change.
*   **Maintain Cohesion:** Classes should have a small number of instance variables, and methods should use them. High cohesion means the methods and variables hang together as a logical whole.
*   **Organize for Change:** Classes should be open for extension but closed for modification (Open-Closed Principle), allowing new functionality without altering existing code.
*   **Depend on Abstractions:** Code should depend upon abstract interfaces, not concrete implementation details (Dependency Inversion Principle).

**Systems and Concurrency**
*   **Separate Construction from Use:** The startup process (instantiating dependencies) should be completely isolated from the runtime logic, often using Dependency Injection or Factories.
*   **Concurrency Separation:** Because concurrent programming is highly complex, thread management should be separated from the rest of the application logic (SRP).

**Emergent Design**
Following four simple rules naturally yields good design:
1.  **Runs all the tests:** The system must be fully testable.
2.  **Contains no duplication:** Eliminate repeated code and algorithms.
3.  **Expresses programmer intent:** Code must be clear enough for the next developer to easily understand.
4.  **Minimizes classes and methods:** Keep the overall system small and avoid pointless dogmatism.