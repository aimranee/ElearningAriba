// GENERATED FILE — do not hand-edit.
// Regenerate with `npm run db:types` after applying a new migration under
// supabase/migrations/. Reflects the local stack's public and app schemas.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  app: {
    Tables: {
      acces_support: {
        Row: {
          chemin_fichier: string
          created_at: string
          id: string
          octets: number | null
          titre: string
          utilisateur_id: string
        }
        Insert: {
          chemin_fichier: string
          created_at?: string
          id?: string
          octets?: number | null
          titre: string
          utilisateur_id: string
        }
        Update: {
          chemin_fichier?: string
          created_at?: string
          id?: string
          octets?: number | null
          titre?: string
          utilisateur_id?: string
        }
        Relationships: []
      }
      contact_message: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          nom: string
          profil: string
          telephone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          nom: string
          profil: string
          telephone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          nom?: string
          profil?: string
          telephone?: string | null
        }
        Relationships: []
      }
      content_item: {
        Row: {
          cle: string
          created_at: string
          description: string | null
          donnees: Json
          duree_heures: number | null
          id: string
          picto: string | null
          position: number
          publie: boolean
          section_cle: string
          statut: string | null
          titre: string | null
          updated_at: string
        }
        Insert: {
          cle: string
          created_at?: string
          description?: string | null
          donnees?: Json
          duree_heures?: number | null
          id?: string
          picto?: string | null
          position: number
          publie?: boolean
          section_cle: string
          statut?: string | null
          titre?: string | null
          updated_at?: string
        }
        Update: {
          cle?: string
          created_at?: string
          description?: string | null
          donnees?: Json
          duree_heures?: number | null
          id?: string
          picto?: string | null
          position?: number
          publie?: boolean
          section_cle?: string
          statut?: string | null
          titre?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_item_section_cle_fkey"
            columns: ["section_cle"]
            isOneToOne: false
            referencedRelation: "content_section"
            referencedColumns: ["cle"]
          },
        ]
      }
      content_section: {
        Row: {
          cle: string
          created_at: string
          eyebrow: string | null
          id: string
          lead: string | null
          position: number
          publie: boolean
          titre: string
          titre_accent: string | null
          updated_at: string
        }
        Insert: {
          cle: string
          created_at?: string
          eyebrow?: string | null
          id?: string
          lead?: string | null
          position: number
          publie?: boolean
          titre: string
          titre_accent?: string | null
          updated_at?: string
        }
        Update: {
          cle?: string
          created_at?: string
          eyebrow?: string | null
          id?: string
          lead?: string | null
          position?: number
          publie?: boolean
          titre?: string
          titre_accent?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      demande_suppression: {
        Row: {
          demandee_le: string
          id: string
          statut: string
          traitee_le: string | null
          utilisateur_id: string
        }
        Insert: {
          demandee_le?: string
          id?: string
          statut?: string
          traitee_le?: string | null
          utilisateur_id: string
        }
        Update: {
          demandee_le?: string
          id?: string
          statut?: string
          traitee_le?: string | null
          utilisateur_id?: string
        }
        Relationships: []
      }
      disponibilite_hebdomadaire: {
        Row: {
          actif: boolean
          created_at: string
          heure_debut: string
          heure_fin: string
          id: string
          jour_semaine: number
          updated_at: string
        }
        Insert: {
          actif?: boolean
          created_at?: string
          heure_debut: string
          heure_fin: string
          id?: string
          jour_semaine: number
          updated_at?: string
        }
        Update: {
          actif?: boolean
          created_at?: string
          heure_debut?: string
          heure_fin?: string
          id?: string
          jour_semaine?: number
          updated_at?: string
        }
        Relationships: []
      }
      exception_agenda: {
        Row: {
          created_at: string
          heure_debut: string | null
          heure_fin: string | null
          id: string
          jour: string
          libelle: string | null
          motif: string
          ouvert: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          heure_debut?: string | null
          heure_fin?: string | null
          id?: string
          jour: string
          libelle?: string | null
          motif?: string
          ouvert?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          heure_debut?: string | null
          heure_fin?: string | null
          id?: string
          jour?: string
          libelle?: string | null
          motif?: string
          ouvert?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      maintien_creneau: {
        Row: {
          created_at: string
          debut: string
          expire_le: string
          fin_avec_tampon: string
          id: string
          jeton: string
          plage: unknown
          type_id: string
        }
        Insert: {
          created_at?: string
          debut: string
          expire_le: string
          fin_avec_tampon: string
          id?: string
          jeton: string
          plage?: unknown
          type_id: string
        }
        Update: {
          created_at?: string
          debut?: string
          expire_le?: string
          fin_avec_tampon?: string
          id?: string
          jeton?: string
          plage?: unknown
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintien_creneau_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "type_rendez_vous"
            referencedColumns: ["id"]
          },
        ]
      }
      profil: {
        Row: {
          created_at: string
          email: string
          nom: string
          preference_actualites: boolean
          preference_rappels: boolean
          prenom: string
          profil_professionnel: string
          role: string
          telephone: string | null
          updated_at: string
          utilisateur_id: string
        }
        Insert: {
          created_at?: string
          email: string
          nom?: string
          preference_actualites?: boolean
          preference_rappels?: boolean
          prenom?: string
          profil_professionnel?: string
          role?: string
          telephone?: string | null
          updated_at?: string
          utilisateur_id: string
        }
        Update: {
          created_at?: string
          email?: string
          nom?: string
          preference_actualites?: boolean
          preference_rappels?: boolean
          prenom?: string
          profil_professionnel?: string
          role?: string
          telephone?: string | null
          updated_at?: string
          utilisateur_id?: string
        }
        Relationships: []
      }
      reservation: {
        Row: {
          annulee_le: string | null
          created_at: string
          debut: string
          fin: string
          fin_avec_tampon: string
          ics_sequence: number
          ics_uid: string
          id: string
          lieu: string
          paiement_requis: boolean
          plage: unknown
          statut: string
          type_id: string
          updated_at: string
          utilisateur_id: string | null
        }
        Insert: {
          annulee_le?: string | null
          created_at?: string
          debut: string
          fin: string
          fin_avec_tampon: string
          ics_sequence?: number
          ics_uid: string
          id?: string
          lieu: string
          paiement_requis?: boolean
          plage?: unknown
          statut?: string
          type_id: string
          updated_at?: string
          utilisateur_id?: string | null
        }
        Update: {
          annulee_le?: string | null
          created_at?: string
          debut?: string
          fin?: string
          fin_avec_tampon?: string
          ics_sequence?: number
          ics_uid?: string
          id?: string
          lieu?: string
          paiement_requis?: boolean
          plage?: unknown
          statut?: string
          type_id?: string
          updated_at?: string
          utilisateur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservation_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "type_rendez_vous"
            referencedColumns: ["id"]
          },
        ]
      }
      type_rendez_vous: {
        Row: {
          actif: boolean
          created_at: string
          duree_minutes: number
          id: string
          libelle: string
          ordre: number
          prix_centimes: number
          tampon_minutes: number
          updated_at: string
        }
        Insert: {
          actif?: boolean
          created_at?: string
          duree_minutes: number
          id: string
          libelle: string
          ordre?: number
          prix_centimes?: number
          tampon_minutes?: number
          updated_at?: string
        }
        Update: {
          actif?: boolean
          created_at?: string
          duree_minutes?: number
          id?: string
          libelle?: string
          ordre?: number
          prix_centimes?: number
          tampon_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      annuler_reservation: {
        Args: { p_id: string }
        Returns: {
          resultat: string
        }[]
      }
      creneaux_libres: {
        Args: {
          p_au: string
          p_du: string
          p_jeton?: string
          p_type_id: string
        }
        Returns: {
          debut: string
          fin: string
        }[]
      }
      deplacer_reservation: {
        Args: { p_debut: string; p_id: string }
        Returns: {
          resultat: string
        }[]
      }
      est_administrateur: { Args: never; Returns: boolean }
      liberer_creneau: {
        Args: { p_jeton: string }
        Returns: {
          resultat: string
        }[]
      }
      maintenir_creneau: {
        Args: { p_debut: string; p_jeton?: string; p_type_id: string }
        Returns: {
          expire_le: string
          jeton: string
          resultat: string
        }[]
      }
      paques: { Args: { annee: number }; Returns: string }
      purger_maintiens_expires: { Args: never; Returns: number }
      reserver_creneau: {
        Args: {
          p_debut: string
          p_jeton?: string
          p_lieu: string
          p_type_id: string
        }
        Returns: {
          reservation_id: string
          resultat: string
        }[]
      }
      reserver_pour_apprenant: {
        Args: {
          p_debut: string
          p_email: string
          p_lieu: string
          p_type_id: string
        }
        Returns: {
          reservation_id: string
          resultat: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  app: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

