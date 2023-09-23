/*Solution

SOLID Principles:
Single Responsibility Principle: La clase LibraryManager se ocupa únicamente de la lógica de la biblioteca, mientras que el servicio EmailService se ocupa del envío de correos electrónicos.
Open/Closed Principle: Las clases están abiertas para extensión (por ejemplo, añadiendo más tipos de notificaciones) pero cerradas para modificación.
Liskov Substitution Principle: User implementa la interfaz IObserver, lo que significa que se puede sustituir por cualquier otro objeto que también implemente la interfaz.
Dependency Inversion Principle: Se inyecta IEmailService en LibraryManager, lo que significa que LibraryManager no depende de una implementación concreta.

Inyección de Dependencias:
Inyectar IEmailService en LibraryManager.

Lambda Expressions:
Usar expresiones lambda en funciones como find y forEach.

Singleton Pattern:
Garantizar que solo haya una instancia de LibraryManager con el método getInstance.

Observer Pattern:
Los usuarios (User) se registran como observadores y son notificados cuando se añade un nuevo libro.

Builder Pattern:
Se utiliza para construir instancias de Book de una manera más limpia y escalable.

Refactorización:
eliminar el uso de ANY mejorar el performance

Aspectos (Opcional)
Puedes anadir logs de info, warning y error en las llamadas, para un mejor control

Diseño por Contrato (Opcional):
Puedes anadir validaciones en precondiciones o postcondiciones como lo veas necesario*/
////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Definición de la interfaz para los observadores
interface MyObserver {
    update(book: Book): void;
}

// Definición de la interfaz para el servicio de correo electrónico
interface mailserv {
    sendEmail(userID: string, message: string): void;
}

// Implementación de la clase de usuario como observador
class User implements MyObserver {
    constructor(private userID: string) {}

    update(book: Book) {
        console.log(`Usuario ${this.userID} notificado: Se ha agregado el libro "${book.title}"`);
        // Aquí puedes implementar la lógica de notificación específica para el usuario
    }
}

// Implementación del servicio de correo electrónico
class EEmailserv implements mailserv {
    sendEmail(userID: string, message: string) {
        console.log(`Enviando email a ${userID}: ${message}`);
        // Implementación real del envío de correo aquí
    }
}
// Implementación del patrón Singleton para LibraryManager
class LibraryManager {
    private static instance: LibraryManager;

    private books: Book[] = [];
    private loans: Loan[] = [];
    private observers: MyObserver[] = [];

    private constructor(private emailService: mailserv) {}

    static getInstance(emailService: mailserv): LibraryManager {
        if (!LibraryManager.instance) {
            LibraryManager.instance = new LibraryManager(emailService);
        }
        return LibraryManager.instance;
    }

    addBook(builder: BookBuilder) {
        const book = builder.build();
        this.books.push(book);
        this.notifyObservers(book);
    }

    removeBook(ISBN: string) {
        const index = this.books.findIndex(book => book.ISBN === ISBN);
        if (index !== -1) {
            this.books.splice(index, 1);
        }
    }

    searchByTitle(title: string): Book[] {
        return this.books.filter(book => book.title.includes(title));
    }

    searchByAuthor(author: string): Book[] {
        return this.books.filter(book => book.author.includes(author));
    }

    searchByISBN(ISBN: string): Book | undefined {
        return this.books.find(book => book.ISBN === ISBN);
    }

    loanBook(ISBN: string, userID: string) {
        const book = this.searchByISBN(ISBN);
        if (book) {
            this.loans.push(new Loan(ISBN, userID, new Date()));
            this.emailService.sendEmail(userID, `Has solicitado el libro ${book.title}`);
        } else {
            throw new Error("El libro no existe");
        }
    }

    returnBook(ISBN: string, userID: string) {
        const index = this.loans.findIndex(loan => loan.ISBN === ISBN && loan.userID === userID);
        if (index !== -1) {
            this.loans.splice(index, 1);
            const book = this.searchByISBN(ISBN);
            if (book) {
                this.emailService.sendEmail(userID, `Has devuelto el libro con ISBN ${ISBN}. ¡Gracias!`);
            }
        } else {
            throw new Error("El préstamo no existe o se equivoco de usuario");
        }
    }
    // observer
    addObserver(observer: MyObserver) {
        this.observers.push(observer);
    }

    // este metodo para modificarlos
    private notifyObservers(book: Book) {
        this.observers.forEach(observer => observer.update(book));
    }
}

// Clase para construir instancias de Book
class BookBuilder {
    private title: string = "";
    private author: string = "";
    private ISBN: string = "";

    withTitle(title: string) {
        this.title = title;
        return this;
    }

    withAuthor(author: string) {
        this.author = author;
        return this;
    }

    withISBN(ISBN: string) {
        this.ISBN = ISBN;
        return this;
    }

    build(): Book{
        return new Book(this.title, this.author, this.ISBN);
    }
}


class Book{
    constructor(public title: string, public author: string, public ISBN: string){}
}

class Loan {
    constructor(public ISBN: string, public userID: string, public date: Date){}
}

const emailService = new EEmailserv();
const libraryManager = LibraryManager.getInstance(emailService);

const user1 = new User("user01");
libraryManager.addObserver(user1);

const bookBuilder = new BookBuilder();
bookBuilder.withTitle("El Gran Gatsby").withAuthor("F. Scott Fitzgerald").withISBN("123456789");
libraryManager.addBook(bookBuilder);

libraryManager.loanBook("123456789", "user01");
