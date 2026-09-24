import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import base from "./__fixtures__/rendu-fr-9fcbf0a.json";
import {
  renderContactAcknowledgement,
  renderContactNotification,
  renderReservationAnnulationOuDeplacementNotice,
  renderReservationConfirmation,
  renderReservationNotification,
  renderSuppressionNotification,
} from "./render";

/*
 * why (#23): the fixture is what these renderers produced at 9fcbf0a, before
 * the acknowledgement learnt English — captured there with the same values,
 * not derived here. French must stay byte-identical to it.
 */
const notificationValues = {
  nom: "Jeanne Martin",
  email: "jeanne.martin@example.test",
  telephone: "—",
  profil: "Consultant",
  message: "Bonjour, une question sur l'appel découverte ?",
};

describe("contact acknowledgement", () => {
  it("renders in English for an English request", () => {
    const email = renderContactAcknowledgement({ prenom: "Jane Smith" }, "en");
    expect(email.subject).toBe("Your message has been received.");
    expect(email.text).toBe(
      [
        "Hello Jane Smith,",
        "",
        "Your message sent through the contact form has been received.",
        "It has been passed on to the trainer.",
        "",
        "Visit the site",
        "This link takes you back to the site while your message is being dealt with.",
        "",
        "Your trainer, certified SAP Ariba expert",
        "This automatic email confirms that your message has been received.",
      ].join("\n"),
    );
  });

  it("renders in French for a French request, byte-identical to base", () => {
    expect(renderContactAcknowledgement({ prenom: "Jeanne Martin" }, "fr")).toEqual(
      base.contactAccusReception,
    );
  });
});

describe("French emails unchanged since base", () => {
  it("keeps the trainer's contact notification", () => {
    expect(renderContactNotification(notificationValues)).toEqual(base.contactNotification);
  });

  it("keeps the other French emails", () => {
    expect(
      renderSuppressionNotification({
        prenom: "Jeanne",
        nom: "Martin",
        email: "jeanne.martin@example.test",
        date: "25 septembre 2026",
      }),
    ).toEqual(base.suppressionCompteNotification);
    expect(
      renderReservationConfirmation({
        prenom: "Jeanne",
        typeRendezVous: "Appel découverte",
        dateHeure: "jeudi 1 octobre 2026 à 10 h 00",
        duree: "30 min",
        montant: "0 €",
        lieu: "https://meet.example.test/abc",
      }),
    ).toEqual(base.confirmationReservation);
    expect(
      renderReservationNotification({
        prenom: "Jeanne",
        nom: "Martin",
        email: "jeanne.martin@example.test",
        typeRendezVous: "Appel découverte",
        dateHeure: "jeudi 1 octobre 2026 à 10 h 00",
        duree: "30 min",
        lieu: "https://meet.example.test/abc",
      }),
    ).toEqual(base.reservationNotification);
    expect(
      renderReservationAnnulationOuDeplacementNotice({
        prenom: "Jeanne",
        dateHeurePrecedente: "jeudi 1 octobre 2026 à 10 h 00",
        dateHeureNouvelle: "vendredi 2 octobre 2026 à 14 h 00",
        contactEmail: "contact@formation-sap-ariba.fr",
      }),
    ).toEqual(base.reservationAnnulationOuDeplacementNotice);
  });
});
