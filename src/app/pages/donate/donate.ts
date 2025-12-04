import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationComponent } from '../../components/notification/notification';
import { AuthService } from '../../services/auth';
import { DonacionesService } from '../../services/donaciones';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationComponent],
  templateUrl: './donate.html',
  styleUrls: ['./donate.css']
})
export class DonateComponent implements OnInit {
  
  monto: number = 2000; 
  montosSugeridos = [1000, 2000, 5000, 10000];
  isLoading = false;
  
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private donacionesService: DonacionesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  seleccionarMonto(valor: number) {
    this.monto = valor;
  }

  async iniciarPago() {
    if (!this.monto || this.monto < 500) {
      this.showNotification('El monto mínimo es $500 pesos.', 'error');
      return;
    }

    this.isLoading = true;
    const currentUser = this.authService.getUser();
    const userId = currentUser ? currentUser.id : null;

    this.donacionesService.crearDonacion(this.monto, userId).subscribe({
      next: (res) => {
        // 👇 CAMBIO IMPORTANTE: Usamos un Formulario POST para redirigir
        // Esto es más seguro y evita errores de cookies en navegadores de PC
        if (res && res.url && res.token) {
          this.submitWebpayForm(res.url, res.token);
        } 
        // Fallback por si el backend solo manda redirect_url (como antes)
        else if (res && res.redirect_url) {
           window.location.href = res.redirect_url;
        } 
        else {
          this.showNotification('Error: Respuesta inválida del servidor.', 'error');
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error Webpay:', err);
        const msg = err.error?.detail || 'No se pudo iniciar la donación.';
        this.showNotification(msg, 'error');
        this.isLoading = false;
      }
    });
  }

  // 👇 NUEVA FUNCIÓN MAGICA: Crea un formulario invisible y lo envía
  submitWebpayForm(url: string, token: string) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'token_ws';
    input.value = token;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit(); // Esto redirige al usuario a Webpay
  }

  showNotification(msg: string, type: 'success' | 'error') {
    this.notificationMessage = msg;
    this.notificationType = type;
    setTimeout(() => this.notificationMessage = null, 4000);
  }
  
  clearNotification() { this.notificationMessage = null; }
}
